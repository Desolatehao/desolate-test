---
title: Docker-Network
lang: zh
Date: 2025-07-23
---

[[toc]]
1. Dockers 是怎么管理网络的？
2. 容器之间、容器与外部是如何通讯的？
3. 如何自定义和管理 Docker 网络？
4. 在微服务架构中，Docker 网络扮演什么样的角色？

### 一、 核心理论：容器网络模型 (CNM)

Docker 的网络功能是基于一个名为 **容器网络模型 (Container Network Model, CNM)** 的规范实现的。CNM 为不同的网络驱动提供了统一的抽象接口，其核心组件构成了 Docker 网络的基础。
- **沙箱 (Sandbox):** 代表一个容器独立的网络栈，包括网络接口（veth pair）、端口、路由表和 DNS 配置。一个沙箱可以连接到多个网络。
- **端点 (Endpoint):** 负责将沙箱连接到网络。它就像一个虚拟网卡，一端在沙箱内，另一端连接到指定的网络。一个端点只能属于一个网络和一个沙箱。
- **网络 (Network):** 是可以相互通信的端点的集合。网络本身是可插拔的，通过不同的网络驱动（Driver）可以实现不同的网络拓扑和功能。
![](https://pic.desolatehao.top/f72306d126a9ffc5971f446b0686a765.png)

![](https://pic.desolatehao.top/448437293fd3da3e4fac32c959d8cfc8.png)
### 二、 Docker 网络驱动 (Network Drivers)

Docker 内置了多种网络驱动，以适应不同的应用场景。可以通过 `docker network ls` 命令查看当前主机上存在的 Docker 网络。

![](https://pic.desolatehao.top/9c94f1210fff78c989b3e099505544cf.png)

以下是几种核心网络驱动的详细解析：

#### 1. Bridge (桥接) 网络

**Bridge** 是 Docker 安装后默认的网络驱动。当启动容器时未指定网络，它就会被连接到默认的 `bridge` 网络。

- **工作原理:** Docker 在宿主机上创建一个名为 `docker0` 的虚拟网桥。所有连接到该网络的容器都会在宿主机上创建一对 veth pair（虚拟网络接口对），一端在容器内（通常是 `eth0`），另一端连接到 `docker0` 网桥。Docker 会为容器分配私有 IP 地址，并通过配置 NAT 规则实现容器对外的访问。
![](https://pic.desolatehao.top/fc31e0d432d1e33801ff51db8c5dcbb5.png)
- **特点:**
    - 提供主机内容器间的隔离和通信。
    - 通过端口映射（Port Mapping）实现容器服务的对外暴露。
    - 是 Docker 最常用、最经典的模式。
- **适用场景:** 单机环境下运行多个需要相互通信的容器。
- **常用命令:**
    - 运行一个 Nginx 容器，并将容器的 80 端口映射到宿主机的 8080 端口：
		`docker run -d --name web-server -p 8080:80 nginx`

#### 2. Host (主机) 网络

**Host** 网络模式下，容器将直接共享宿主机的网络命名空间。

- **工作原理:** 容器不再拥有独立的网络栈，而是直接使用宿主机的网络接口和 IP 地址。
- **特点:**
    - 网络性能最高，因为它绕过了虚拟化网络层，性能几乎等同于宿主机上的原生进程。
    - 容器端口直接暴露在宿主机上，无需端口映射，但也容易引发端口冲突。
    - 牺牲了容器的网络隔离性，安全性较低。
- **适用场景:** 对网络性能有极致要求，且可以接受牺牲网络隔离性的特定场景，如网络监控或需要处理大量数据包的应用。
- **常用命令:**
```
docker run -d --net=host nginx
```
![](https://pic.desolatehao.top/acfb2daed09b99cc357e87cf5163b04f.png)
#### 3. None (无) 网络

**None** 网络模式下，容器拥有独立的网络命名空间，但 Docker 不会为其进行任何网络配置。

- **工作原理:** 容器被创建后，其网络栈中只有一个 `lo` (loopback) 接口，没有任何外部网络连接。
- **特点:**
    - 容器完全与外界隔离，提供了最高的网络安全性。
- **适用场景:**
    - 执行批处理任务或计算任务，完全不需要网络的容器。
    - 需要使用自定义网络工具（如 `pipework`）进行高度定制化网络配置的场景。
- **常用命令:**
```
docker run --rm --net=none alpine ip addr
```

#### 4. Overlay (覆盖) 网络

**Overlay** 网络是一种分布式网络，用于连接运行在不同宿主机上的 Docker 容器，是实现 Docker Swarm 集群中跨主机容器通信的核心。

- **工作原理:** Overlay 网络通过 VXLAN 等隧道技术，在多个 Docker 宿主机之间创建一个虚拟的二层网络。它使得不同主机上的容器感觉就像在同一个局域网中一样，可以直接通过 IP 地址通信。它通常需要一个键值存储服务（如 Swarm 内置的 Raft store）来维护网络状态。
- **特点:**
    - 原生支持跨主机容器通信。
    - 为 Swarm 服务提供了内置的服务发现和负载均衡功能。
    - 配置相对复杂，但功能强大。
- **适用场景:** Docker Swarm 集群环境下的多机、多容器应用部署。
- **常用命令:**
    - （在 Swarm manager 节点上）创建一个 Overlay 网络：
```
docker network create -d overlay my-swarm-network
```
![](https://pic.desolatehao.top/ea124c904dafb73124d98005d7d1758b.png)

>后日记：k8s与Docker Swarm中的跨Node的通讯协议都是基于此来实现的
>Kubernetes和Docker Swarm都需要Overlay网络来实现跨主机通信。区别在于，Docker Swarm将其作为内置功能直接提供，而Kubernetes通过CNI插件生态系统来提供，用户选择的CNI插件（如Flannel）在底层实现了Overlay网络。

>后日记：k8s中另外两种网络驱动 `macvlan` 和 `ipvlan`

#### 5. Macvlan 网络
- **工作原理:** 允许你为容器分配一个 MAC 地址，使其在网络上显示为一台独立的物理设备。容器的流量通过指定的物理网卡（例如 `eth0`）直接路由，而不是通过 `docker0` 网桥进行 NAT 转换。
- **特点:**
    - 性能极高，接近物理机。
    - 容器直接暴露在外部网络，可以被网络中的其他设备直接访问，无需端口映射。
    - 非常适合那些需要与物理网络设备（如路由器、防火墙）直接交互的传统应用。
- **注意:** 默认情况下，使用 `macvlan` 的容器无法与宿主机直接通信。

#### 6. Ipvlan 网络

- **工作原理:** 与 `macvlan` 类似，但工作在 L3（IP 层）。同一网络下的所有容器共享宿主机的 MAC 地址，但拥有各自独立的 IP 地址。
- **特点:**
    - 同样具有很高的性能。
    - 相比 `macvlan`，`ipvlan` 对物理网络设备更友好，因为不会产生大量的 MAC 地址（避免了交换机的 MAC 地址表耗尽问题）。

### 三、 自定义网络的应用

虽然 Docker 提供了默认的 `bridge` 网络，但在生产环境中，强烈推荐为应用创建自定义的 `bridge` 网络。

- **核心优势:**
    - **自动服务发现:** 自定义网络提供了内置的 DNS 服务。在同一自定义网络中的容器，可以直接通过 **容器名** 作为主机名进行通信。
    - **更好的隔离性:** 自定义网络提供了更好的网络隔离。默认情况下，不同自定义网络中的容器无法通信，保证了应用的安全性。而默认的 `bridge` 网络中的所有容器都可以互相访问。
    - **动态连接管理:** 可以随时将一个正在运行的容器连接到或断开一个自定义网络，而无需重启容器。
- **常用命令:**

- 创建一个自定义 bridge 网络：`docker network create my-app-net`
- 运行容器时指定网络：
```
docker run -d --name=database --net=my-app-net postgres
docker run -d --name=api --net=my-app-net my-api-image
查看网络的详细信息，包括连接到该网络的容器：
docker network inspect my-app-net
```
- 将一个正在运行的容器连接到网络：`docker network connect my-app-net some-running-container`

### 四、容器互连

场景：不同桥接网卡网段容器有连接需求
```shell
docker network create my-net01
docker network create --subnet=10.10.0.0/24 my-net02

# 在 my-net01 启动容器
docker run -d --name web --network my-net01 nginx

# 在 my-net02 启动容器
docker run -d --name db --network my-net02 nginx

# 测试 web 到 db 的连通性
docker exec web ping db
```
![](https://pic.desolatehao.top/76246ade7221021167ea59cdf3b7a682.png)
原因：不同桥接网段IP为不同子网段，默认隔离
![](https://pic.desolatehao.top/e180ca1538a0030aa03c5b008b0d5f21.png)
![](https://pic.desolatehao.top/4bea13aa1a6eee88b6931e3e0e73e7e6.png)

解决办法：容器加入多个网络
```shell
# 将 db 容器加入 web 所在的网络
docker network connect my-net01 db

# 再次测试（成功）
docker exec web ping db

# 使用 inspect 查看 db 容器网络 出现了多网卡地址
```
![](https://pic.desolatehao.top/1073a6a25f1b31239cf8d90903934f10.png)
