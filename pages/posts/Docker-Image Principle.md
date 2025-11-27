---
title: Docker-镜像原理
Date: 2025-07-14
---
1. 为什么容器可以那么快速启动服务？
2. 为什么Docker镜像可以如此轻量？
## 联合文件系统

因为联合文件系统（UFS）

联合文件系统（Union File System），顾名思义，是一种可以将多个目录（也称为“分支”）的内容**联合挂载**（union mount）到同一个目录下的文件系统。它能将来自不同位置的文件和目录透明地叠加在一起，形成一个单一的、连贯的视图

**UnionFS的核心特性：**

- **分层（Layering）**：文件系统由多个层组成。
- **写时复制（Copy-on-Write, CoW）**：这是UnionFS的精髓所在

## 分层理解

- **Docker镜像（Image）= 一系列只读层（Read-only Layers）**
    - 你编写的`Dockerfile`中的每一条指令（如`RUN`, `COPY`, `ADD`等）都会创建一个新的文件系统层。
    - 这些层是**只读的、不可变的**。
    - 下一层会叠加在上一层之上。例如，一个基于Ubuntu的Nginx镜像，其底层是Ubuntu操作系统的各个层，上层是安装Nginx的层。
    - 这种分层结构极大地提高了镜像的复用性。如果你有多个容器都基于同一个Ubuntu镜像，它们在磁盘上共享相同的Ubuntu只读层，极大地节省了存储空间。

- **Docker容器（Container）= 镜像只读层 + 一个可写层（Writable Layer）**
    - 当你使用`docker run`命令启动一个容器时，Docker会在镜像的所有只读层之上，添加一个**薄薄的可写层**，我们称之为“容器层”。
    - 所有对容器的修改（如创建新文件、修改现有文件、删除文件）都发生在这个可写层中。
    - 底下的镜像层保持不变。

```
+-----------------------------------+  <-- 容器（可读写）
|        容器可写层 (Writable)       |
+-----------------------------------+
|      镜像层 3 (Read-only)         |  <-- 镜像（只读）
+-----------------------------------+
|      镜像层 2 (Read-only)         |
+-----------------------------------+
|      镜像层 1 (Read-only)         |
+-----------------------------------+
|         基础镜像 (Base Image)      |
+-----------------------------------+
```

## 写时复制

CoW(**Copy-on-Write**)机制是实现效率和分层隔离的关键。

1. **读取文件**：当容器需要读取一个文件时，它会从上到下（从可写层到最底层的只读层）逐层查找。一旦找到，就立即返回。由于大部分文件存在于只读的镜像层，这个过程非常快。
    
2. **修改文件**：如果你要修改一个存在于只读层（比如镜像层）的文件（例如 `/etc/nginx/nginx.conf`）：
    - UnionFS **不会**直接修改只读层的文件。
    - 它会触发**写时复制**操作：将该文件从其所在的只读层**复制**到最顶层的**可写层**。
    - 之后，你对文件的所有修改都作用于这个新复制出来的文件。下层的原始文件被上层的新文件“遮挡”了，但并未被物理删除。

3. **添加文件**：在容器中创建一个新文件时，该文件会直接被创建在顶层的可写层中。
    
4. **删除文件**：如果你要删除一个存在于只读层的文件：
    - 只读层的文件无法被物理删除。
    - UnionFS会在可写层创建一个名为`.wh.`（whiteout）的特殊标记文件，用来“遮挡”下层的文件。从用户的视角看，这个文件确实被删除了。
    - **重要提示**：这也解释了为什么在`Dockerfile`中，即使你在后面的层删除了前面层添加的大文件，镜像的总体积并不会减小。因为底层的那个大文件依然存在，只是被whiteout文件标记为“不可见”。

### 联合文件分析

![](https://pic.desolatehao.top/715237ecf07698637580cf3f27897038.png)
#### **逐层构建**
`docker history` 的输出是**倒序**的，最下面的是最基础的层，最上面的是最新的层。我们可以从下往上，一步步看这个Nginx镜像是如何“盖楼”的：

- **基础层 (Base Layer)**：最底部是一个 `74.8MB` 的层。这是整个镜像的起点，通常是一个基础操作系统。从注释 `debian.sh ... 'bookworm'` 这是一个Debian "bookworm" 系统的基础镜像。
- **配置与安装层**：
    - 一系列 `ENV` 和 `LABEL` 指令，它们用于设置环境变量和镜像元数据。
    - 接着是一个关键的 `RUN` 指令层，大小为 `117MB`。这个层执行了大量的命令，比如添加用户组、更新软件包列表、安装Nginx及其依赖。所有这些操作产生的文件变更，都被记录在了这个 `117MB` 的层里。
    - 再往上是一系列的 `COPY` 指令，它们将一些脚本文件（如入口脚本 `docker-entrypoint.sh` 和一些配置文件）复制到镜像中。每个`COPY`都创建了一个很小的层。
- **元数据层 (Metadata Layers)**：最顶部的几层是 `ENTRYPOINT`, `EXPOSE`, `STOPSIGNAL`, `CMD`。这些指令不修改文件系统，只修改镜像的配置（元数据），告诉Docker如何运行这个容器。
#### **层的大小与写时复制**
这是最有意思的部分，它直观地展示了哪些操作会“增肥”镜像：
- **大小为 0B 的层**： 你会发现 `CMD`, `ENV`, `LABEL`, `EXPOSE` 等指令产生的层大小都是 `0B`。这是因为它们**没有对文件系统进行任何读写操作**。它们只是修改了镜像的元数据（一个JSON配置文件）。所以，它们创建的层是“空的”，不占用文件系统空间。
    
- **有大小的层**：
    - `RUN`、`COPY`、`ADD` 这类指令会实际地在文件系统中添加、修改或删除文件。因此，它们创建的层是有体积的。
    - `RUN ... 117MB`：这个层包含了安装Nginx时产生的所有新文件。
    - `COPY ... 4.62kB`：这个层只包含了被复制进来的那个几KB的脚本文件。
    - 这完美诠释了**写时复制（Copy-on-Write）**在镜像构建时的体现：每一次“写”操作（RUN, COPY），都会生成一个新的、包含变更内容的层。


为什么除了最顶层，其他层的 `IMAGE` ID 都是 `<missing>`？

这是因为现代Docker默认使用了一个叫做 **BuildKit** 的新一代构建引擎。BuildKit为了优化构建过程，并不会为`Dockerfile`中的每一行都创建一个可被独立引用的“中间镜像”（intermediate image）。它将构建过程视为一个依赖图，并进行优化。因此，在历史记录中，这些中间步骤的层存在，但它们没有被保存为独立的、有ID的镜像，故显示为 `<missing>`。只有最终的产物，也就是最顶层的 `9592f5595f2b`，才是我们最终得到的 `nginx:latest` 镜像
## commit镜像

这里用一个Ubuntu镜像来进行二开
```bash
docker run -it --name my-ubuntu-container ubuntu:latest /bin/bash
apt-get update # 这一步是必须的
apt install vim -y
echo "My custom image with working vim!" > /my_note.txt
exit

docker commit my-ubuntu-container-test my-ubuntu-with-vim:v1
sha256:684297ce3b235f7d0ed26413d2427a5e90b0ad09ec741bef3d723543ff889ad2
这里有sha256就打包成功了
```
![](https://pic.desolatehao.top/e53c1c2a2e669a36543e0846bfe4440e.png)
用history看看
![](https://pic.desolatehao.top/0b92330c118def0b0a36220d64dc4015.png)

```bash
IMAGE          CREATED         CREATED BY           SIZE      COMMENT
# 这一层是你通过 docker commit 创建的
684297ce3b23   3 minutes ago   /bin/bash            122MB     <-- 这是你所有操作（更新apt、安装vim、创建文件）的总和，被打包成一个层。创建命令是启动容器的 /bin/bash。

# --- 以下是基础镜像 ubuntu:latest 自带的层 ---
f9248aac10f2   3 weeks ago     /bin/sh -c #(nop) CMD ["/bin/bash"]             0B        
<missing>      3 weeks ago     /bin/sh -c #(nop) ADD file:0ebb3dd98809cffc1…   78.1MB    
<missing>      ...

```

这里再用`Dockerfile`构建一下
创建Dockerfile文件，写入以下内容
```dockerfile
#1. 指定基础镜像
from ubuntu:latest

# 2. 更新apt源并安装vim。我们通常把这两步放一起，以保证缓存的有效性，并清理缓存减小镜像体积
run apt-get update && apt install vim -y \
	&& rm -rf /var/lib/apt/lists/*

#3. 创建文件
run echo "My custom image with working vim!" > /my_note.txt 
```
`docker build -t my-ubuntu-with-vim:v2 .` 构建
![](https://pic.desolatehao.top/c76285b851c49d5f8fcf37c13c654c63.png)
这里就可以清晰的看到类似于`history`的构建过程

