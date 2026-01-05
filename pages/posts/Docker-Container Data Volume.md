---
title: Docker-容器数据卷
lang: zh
date: 2025-07-15
---
1. 当容器被删除(`docker rm`)后，容器内部所有未持久化的数据都会丢失，如何保存？
2. 多个容器之间默认是相互隔离的，如何共享数据？
3. 在容器的可写层进行频繁的I/O操作性能不如操作宿主机文件系统，如何优化性能？

为了解决这些问题，Docker 提出了**数据卷（Volume）** 的概念。

> **核心思想**：将宿主机（Host）上的目录或文件，直接映射（挂载）到容器内的指定路径。这样，数据的读写实际上是在操作宿主机上的文件，从而绕开了容器本身的文件系统。

**数据卷的特点：**
- **数据持久化**：数据存储在宿主机上，即使容器被删除，数据依然存在。
- **容器间共享**：可以将同一个数据卷挂载到多个容器，实现数据共享。
- **独立生命周期**：数据卷的生命周期独立于容器，可以单独创建、管理和删除。
- **高性能**：绕过容器的存储层，直接与宿主机文件系统交互，性能更高。

#### 数据卷的主要类型

Docker 主要提供三种方式来实现数据持久化，你需要清晰地理解它们的区别和适用场景。

| 类型             | 英文名             | 描述                                                                                        | 推荐场景                             |
| -------------- | --------------- | ----------------------------------------------------------------------------------------- | -------------------------------- |
| **卷 (Volume)** | **Volume**      | **Docker 官方最推荐的方式**。由 Docker 管理，存储在宿主机的一个特定目录（如 `/var/lib/docker/volumes/`），与宿主机文件系统结构解耦。 | 生产环境、数据库数据、应用生成的数据、需要在多容器间共享的数据。 |
| **绑定挂载**       | **Bind Mount**  | 将宿主机上**任意位置**的目录或文件直接挂载到容器中。                                                              | 开发环境（挂载源代码）、挂载宿主机上的配置文件。         |
| **内存挂载**       | **tmpfs Mount** | 将数据存储在宿主机的内存中，不写入磁盘。容器停止后数据即丢失。                                                           | 存储临时性、非持久化的敏感数据，或对性能要求极高的临时读写。   |
在 `docker run` 命令中，我们主要使用 `-v` 或 `--mount` 参数来挂载数据卷。`--mount` 语法更长，但更明确易读，是官方推荐的方式。

格式：--mount source=<卷名>,target=<容器内路径>
格式：-v <卷名>:<容器内路径>

```
-v 容器内路径               #匿名挂载
-v 卷名:容器内路径          #具名挂载       会自动创建卷
-v /宿主机地址:容器内路径    #指定路径挂载
```

##### 卷 (Volume)
**特点**：我们只指定容器内的路径，Docker 会自动为我们创建和管理宿主机上的目录。也可以先创建卷，再指定挂载。

**语法一：匿名卷 (Anonymous Volume)**
只指定容器内路径，Docker 会在宿主机上创建一个随机命名的目录与之对应。
```shell
# 运行一个Nginx容器，并将容器内的 /usr/share/nginx/html 目录挂载为一个匿名卷
docker run -d -p 8080:80 --name my-nginx-anon -v /usr/share/nginx/html nginx

# 查看容器，可以看到 Mounts 部分有一个随机命名的卷
docker inspect my-nginx-anon
```
![](https://pic.desolatehao.top/e762820877e818b322e54ecff301c135.png)

> **缺点**：因为卷名是随机的，不方便后续引用和管理。


**语法二：命名卷 (Named Volume)** - **最常用**
我们为卷指定一个名字，方便管理和重用。
```shell
# 方式A：在运行时自动创建命名卷
# 格式：-v <卷名>:<容器内路径>
docker run -d -p 8081:80 --name my-nginx-named -v nginx-data:/usr/share/nginx/html nginx

# 方式B：先创建卷，再挂载 (更规范)
docker volume create my-app-data

docker run -d -p 8082:80 --name my-app-container \
  -v my-app-data:/app/data \
  ubuntu

# 使用 --mount 语法 (更清晰)
# 格式：--mount source=<卷名>,target=<容器内路径>
docker run -d -p 8083:80 --name my-nginx-mount \
  --mount source=nginx-data-2,target=/usr/share/nginx/html \
  nginx
```
![](https://pic.desolatehao.top/493dd7f881756a4318f64991fab68dc4.png)
测试持久化
```shell
#容器中创建一个文件
docker exec my-nginx-named bash -c 'echo "<h1>Hello from Volume!</h1>" > /usr/share/nginx/html/index.html'
curl http://localhost:8081 #测试

#删除
docker rm -f my-nginx-named

#新创建一个容器，挂载同一个命名卷nginx-data
docker run -d -p 8081:80 --name my-nginx-new -v nginx-data:/usr/share/nginx/html nginx
curl http://localhost:8081 #测试发现结果一样
```

##### 绑定挂载 (Bind Mount)
**特点**：将宿主机上的一个**已知路径**映射到容器中。

**使用场景**：
- **开发时同步代码**：将本地代码目录挂载到容器中，本地修改代码后，容器内应用能立即生效，无需重新构建镜像。
- **挂载配置文件**：将宿主机上的 Nginx 配置文件挂载到容器中，方便修改。

**格式**：-v <宿主机绝对路径>:<容器内路径>

语法
```shell
# 注意：宿主机路径必须是绝对路径，或者以 `.` `./` 开头
# 示例：将当前目录下的 `my-html` 文件夹挂载到 Nginx 容器
# 先在当前目录创建一个 my-html 文件夹，并放入一个 index.html 文件
mkdir my-html
echo "<h1>Hello from Bind Mount!</h1>" > my-html/index.html

docker run -d -p 8084:80 --name my-nginx-bind \
  -v "$(pwd)/my-html":/usr/share/nginx/html \
  nginx

# 使用 --mount 语法 (更清晰)
# 格式：--mount type=bind,source=<宿主机绝对路径>,target=<容器内路径>
docker run -d -p 8085:80 --name my-nginx-bind-mount \
  --mount type=bind,source="$(pwd)/my-html",target=/usr/share/nginx/html \
  nginx
```

>这里遇到了本次curl测试连接被重置的情况，排查（文件&文件夹权限-容器内部服务正常-防火墙端口转发正常），最后重启了docker服务，删除镜像，才解决问题，AI解释如下

![](https://pic.desolatehao.top/2552dda2b879343ab4f877070b3ca6d8.png)

#### 数据卷权限
目的：分离权限划分

	ro  readonly   #只读
	rw  readwrite  #可读可写

```
docker run -d -p 8088:80 /home/test/html:/etc/nginx:ro  nginx
docker run -d -p 8088:80 test-nginx:/etc/nginx:rw  nginx

#看见ro 就代表容器只能读，文件的更改只能由宿主机来操作
```