---
title: Docker-DockerFile
Date: 2025-07-22
---
1. 能不能从0或者从其他镜像进行编写配置文件？
2. 能不能先写好配置文件然后一键构建镜像？

#### **Dockerfile**

- **它是一个文本文件**，里面包含了一系列指令（Instructions）。
- **它是镜像的“配方”或“蓝图”**。`docker build` 命令会读取这个文件，然后根据指令一步步地构建出一个新的 Docker 镜像。
- **核心思想：分层构建**。Dockerfile 中的每一条指令都会创建一个新的镜像层（Layer）。Docker 会巧妙地缓存这些层，如果指令没有变化，下次构建时会直接使用缓存，大大加快了构建速度。

#### 常用指令

| 指令               | 作用                                                 | 示例与说明                                                                                                        |
| :--------------- | :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **`FROM`**       | **指定基础镜像**。所有构建都必须从一个基础镜像开始。                       | `FROM python:3.9-slim` <br> *最佳实践：选择官方、轻量（如 `slim`, `alpine`）且版本明确的镜像。*                                      |
| **`WORKDIR`**    | **设置工作目录**。后续的 `RUN`, `CMD`, `COPY` 等指令都会在这个目录下执行。 | `WORKDIR /app` <br> *最佳实践：先设置工作目录，避免在各处使用绝对路径，让 Dockerfile 更清晰。*                                             |
| **`COPY`**       | **复制文件或目录**。从构建上下文（通常是 Dockerfile 所在目录）复制到镜像内部。    | `COPY ./requirements.txt .` <br> *`.` 代表当前工作目录，即 `/app`。推荐使用 `COPY` 而不是 `ADD`，因为它的行为更明确。*                    |
| **`RUN`**        | **在镜像构建过程中执行命令**。主要用于安装软件包、编译代码等。                  | `RUN pip install -r requirements.txt` <br> *每条 `RUN` 指令都会创建一个新的层。为了减小镜像体积，应将多个命令用 `&&` 连接起来。*                |
| **`EXPOSE`**     | **声明容器运行时监听的端口**。这只是一个元数据声明，**不起实际的端口映射作用**。       | `EXPOSE 5000` <br> *它告诉使用者这个镜像的服务会监听 5000 端口，实际映射仍需在 `docker run -p` 中指定。*                                   |
| **`ENV`**        | **设置环境变量**。这个变量在镜像的整个生命周期中都存在。                     | `ENV FLASK_APP=app.py` <br> *用于配置应用，非常灵活。*                                                                   |
| **`CMD`**        | **容器启动时执行的默认命令**。一个 Dockerfile 中只能有一条 `CMD` 生效。    | `CMD ["flask", "run", "--host=0.0.0.0"]` <br> *如果 `docker run` 命令后面跟了其他命令，`CMD` 会被覆盖。推荐使用 Exec 格式（JSON 数组）。* |
| **`ENTRYPOINT`** | **配置容器的入口点**。与 `CMD` 类似，但**不容易被覆盖**。               | `ENTRYPOINT ["python", "-m"]` <br> *常用于制作“工具型”容器。`CMD` 的内容会作为参数传递给 `ENTRYPOINT`。*                            |

#### **`CMD` 与 `ENTRYPOINT` 的区别**

- **`CMD`**: 设置**默认**命令，容易被覆盖。适合为容器提供一个默认的、可被用户轻易修改的执行任务。
- **`ENTRYPOINT`**: 设置**主要**命令，不易被覆盖。适合将容器制作成一个可执行程序。

`CMD` 和 `ENTRYPOINT` 都有两种语法形式
**Exec 格式 (推荐)**: `CMD ["executable", "param1", "param2"]`
**Shell 格式**: `CMD command param1 param2`

组合使用：
假设 Python 应用可以接收一个 `--port` 参数。
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

# 入口点是 python 命令
ENTRYPOINT ["python", "app.py"]

# CMD 提供默认参数
CMD ["--port", "80"]
```

- **不带任何参数运行**：`CMD` 作为 `ENTRYPOINT` 的参数，使用默认端口 80。
```bash
docker run -p 80:80 my-flexible-app
# 容器内实际执行: python app.py --port 80
```

- **带参数运行**：`docker run` 后面的参数会**覆盖** `CMD`，并作为 `ENTRYPOINT` 的参数。
```bash
docker run -p 8080:8080 my-flexible-app --port 8080
# 容器内实际执行: python app.py --port 8080

docker run my-flexible-app --help
# 容器内实际执行: python app.py --help
```

| 使用方式                     | Dockerfile 示例                                               | `docker run <image>` 执行        | `docker run <image> arg1` 执行        | 适用场景                              |
| :----------------------- | :---------------------------------------------------------- | :----------------------------- | :---------------------------------- | :-------------------------------- |
| **只有 `CMD`**             | `CMD ["python", "app.py"]`                                  | `python app.py`                | `arg1` (CMD被覆盖)                     | 简单的应用，或需要方便地用 `bash` 等命令进入容器进行调试。 |
| **只有 `ENTRYPOINT`**      | `ENTRYPOINT ["ping"]`                                       | `ping` (可能会报错，因缺少参数)           | `ping arg1`                         | 制作工具类镜像，但不够友好，最好搭配 `CMD`。         |
| **`ENTRYPOINT` + `CMD`** | `ENTRYPOINT ["python", "app.py"]`<br>`CMD ["--port", "80"]` | `python app.py --port 80`      | `python app.py arg1`                | **最佳实践**。创建稳定、可预测且灵活的应用镜像。        |
| **Shell 格式**             | `ENTRYPOINT /usr/bin/app.sh`                                | `/bin/sh -c "/usr/bin/app.sh"` | `/bin/sh -c "/usr/bin/app.sh" arg1` | 不推荐。仅在需要 shell 特性且了解其副作用时使用。      |


#### **构建镜像的最佳实践**

1. **使用 `.dockerignore` 文件**：在 Dockerfile 同级目录下创建一个 `.dockerignore` 文件（语法类似 `.gitignore`），排除掉不需要复制到镜像中的文件（如 `.git`, `node_modules`, `*.md`），可以减小镜像体积和构建时间。
    
2. **利用构建缓存**：将**不经常变化**的指令放在前面，**经常变化**的指令放在后面。
    
    - **错误示范**: `COPY . .` -> `RUN pip install -r requirements.txt` (每次代码变动，都要重新安装依赖)
    - **正确示范**: `COPY requirements.txt .` -> `RUN pip install -r requirements.txt` -> `COPY . .` (只有当 `requirements.txt` 变化时，才会重新安装依赖)
3. **合并 `RUN` 指令**：使用 `&&` 将多个 `RUN` 命令合并为一条，以减少镜像层数。
```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```
注意最后清理缓存，减小镜像体积
    
4. **使用多阶段构建 (Multi-stage Builds)**：对于需要编译的语言（如 Go, Java, C++），这是一个神器。你可以用一个包含完整编译环境的“构建阶段”来编译代码，然后只把编译好的二进制文件复制到一个极小的“运行阶段”镜像中。这能让最终镜像的体积减小 90% 以上。


#### 测试

在`my-app`文件夹下创建requirements.txt、app.py文件，内容分别如下
```ini
flask
Werkzeug<3.0
```

```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, Docker!'

if __name__ == '__main__':
    app.run(host='0.0.0.0')
```

请在 `my-flask-app` 文件夹中创建一个名为 `Dockerfile` 的文件，并满足以下所有要求：

1. 使用官方的 `python:3.9-slim` 作为基础镜像。
2. 在镜像内创建一个工作目录 `/app`。
3. **优化构建缓存**：先复制 `requirements.txt` 文件到镜像中，然后安装依赖。之后再复制所有其他文件（即 `app.py`）。
4. 安装 `requirements.txt` 中指定的所有 Python 包。
5. 声明容器将会监听 `5000` 端口（Flask 的默认端口）。
6. 设置容器启动时要执行的默认命令，以运行这个 Flask 应用。

回答：
1. 创建`requirements.txt`与`app.py`文件，写入内容
2. 写 Dockerfile 文件
3. 构建docker image
4. 启动容器，测试结果

```dockerfile
from python:3.9-slim
workdir /app
copy requirements.txt ./requirements.txt
run pip install -r requirements.txt
copy . . 
expose 5000
cmd ["flask","run","--host=0.0.0.0"]
```

```shell
# 构建镜像   -t是打tag
docker build -t my-app:1.0 . 
# 以此镜像运行容器
docker run -d -p 5001:5000 --name my-app-01 my-app:1.0

# 测试
curl 127.0.0.1:5001

# 回显成功
Hello, Docker!
```

#### 问题汇总
1. 构建镜像时源 python:3.9-slim 时拉取失败
	网络问题：重启docker服务 
		systemctl restart docker

2. 在测试阶段编写 Dockerfile 后创建容器失败
	路径问题：对于 Dockerfile 文件来说只认识当前目录环境
	copy /root/my-flask-app/requirements.txt ./requirements.txt
	不能写这种绝对路径，因为在 docker 构建镜像的时候会加一个 '.' 点 ,代表着构建上下文， docker 会把这个文件下的所有文件都丢给docker守护进程，守护进程在构建镜像时，只能访问我们发送给它的这些文件。
	所以我们在 Dockerfile 中写路径文件的时候不需要加上绝对路径，守护进程会自动拼接成绝对路径
	Docker 实际寻找的路径是：**[构建上下文的路径]** + **[COPY指令的源路径]**

 3. 构建镜像时下载 requirement 资源失败
	 最初的时候在 requirements.txt 写的是`Flask==2.2.2`，导致在`build`的时候出现
```shell
WARNING: Retrying (Retry(total=3, connect=None, read=None, redirect=None, status=None)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.conne => => # ction.HTTPSConnection object at 0x72dcbb14baf0>: Failed to establish a new connection: [Errno -3] Temporary failure in name resolution')': /simple/flask/
```
	问题原因是因为版本不对，后AI给出答案，已更改为 
```r
flask
Werkzeug<3.0
```


#### 后日记
##### 非Root
Dockerfile中的切换非root用户
```Dockerfile
3. 遵循安全最佳实践：创建并切换到非 root 用户
addgroup 创建组，adduser 创建用户并加入组
 -S 表示创建系统用户（无密码，无主目录）

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```


##### 多段构建
```dockerfile
from golang:alpine as builder
workdir /app

copy go.mod ./
run go mod download
copy . .
run CGO_ENABLED=0 GOOS=linux go build -a -ldflags "-w -s" -o /app/my-go-app .


from scratch as last
copy --from=builder /app/my-go-app /my-go-app
expose 8080

entrypoint ["/my-go-app"]
```
利用多段构建能够大幅度降低镜像体积，以及减少暴露面
诸如以下类型的项目，直接打包好文件

| 语言/框架            | 构建阶段需要 (厨房)                     | 最终产物 (菜肴)           | 运行阶段需要 (餐厅)                        |
| :--------------- | :------------------------------ | :------------------ | :--------------------------------- |
| **Go**           | Go SDK, 源代码, 依赖包                | 单个静态二进制文件           | `scratch` 或 `distroless` + 二进制文件   |
| **Java**         | JDK, Maven/Gradle, 源代码          | `.jar` / `.war` 文件  | JRE + `.jar` 文件                    |
| **Node.js (TS)** | Node.js, npm, `devDependencies` | 编译后的 `.js` 文件       | Node.js, `dependencies` + `.js` 文件 |
| **React/Vue**    | Node.js, npm, `devDependencies` | 静态 `html/css/js` 文件 | `nginx` + 静态文件                     |
| **C/C++**        | GCC, make, dev-libs             | 二进制文件, `.so` 库      | 基础镜像 + 二进制文件/库                     |

**为什么多段构建的结果能那么小？**

	比如我们有两个车间，一个是生产车间，一个是展厅
	我们在第一个 from 里下载了很多的工具(环境依赖)，用来生产处理原材料(代码)，最后的结果就是生产一个精致的中间产品，这个产品(文件)会存储在工作目录中，当我们使用 from 开始，之前的车间就已经完全丢弃了，只有之前生成的文件保留了下来，在第二个 from 中把产品放进去二次利用 开始展示使用。
		整体并非同层次，而是接力赛，流水线的形式


多阶段构建的精髓在于**隔离**和**选择性复制**。

1. **隔离 (Isolation)**：每个 `FROM` 都是一个独立的沙盒。
2. **选择性复制 (Selective Copy)**：`COPY --from` 充当一个精确的“传送门”，只把你需要的、干净的最终产物传送到最后一个沙盒。
3. **最终结果 (Final Image)**：只有最后一个沙盒（阶段）会被保存为最终的镜像。之前的所有阶段，连同它们所有的工具和中间垃圾，都会在构建结束后被彻底丢弃。

以下为例
```dockerfile
FROM python:3.9 AS builder
ARG APP_VERSION=1.0.0
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .

FROM python:3.9-slim AS final
ARG APP_VERSION
WORKDIR /app
ENV APP_VERSION=${APP_VERSION}
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /app/app.py .

ENTRYPOINT ["uvicorn"]
CMD ["app:app", "--host", "0.0.0.0", "--port", "8000"]

EXPOSE 8000
```

| 步骤 | 发生了什么 | 临时环境大小 | 最终镜像大小 |
| :--- | :--- | :--- | :--- |
| **阶段1: Builder** | | | |
| `FROM python:3.9` | 拉取基础镜像 | 900 MB | 0 MB (还没开始) |
| `RUN apt-get install gcc...` | 安装编译工具 | 900 MB -> 1.2 GB | 0 MB |
| `RUN pip install ...` | 安装Python依赖 | 1.2 GB -> 1.3 GB | 0 MB |
| **阶段2: Runner** | | | |
| `FROM python:3.9-slim` | **【重置！】** 抛弃上面的一切，拉取一个新镜像 | 120 MB | 120 MB (这是新起点) |
| `COPY --from=builder ...` | 从阶段1的最终状态里，只复制`site-packages`和`app.py` (假设50MB) | 120 MB -> 170 MB | 120 MB -> 170 MB |
| **构建结束** | 抛弃阶段1的所有内容 | - | **最终大小: 170 MB** |
