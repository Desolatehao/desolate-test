---
title: Docker-常用命令-test
date: 2025-07-08
lang: zh
---
[[toc]]
## 镜像命令

### docker images 查看本地镜像
![](https://pic.desolatehao.top/cfc34117312981a61bcccc64dc095a09.png)
```shell
# 解释 
REPOSITORY   镜像的仓库源 
TAG          镜像的标签 
IMAGE ID     镜像的id 
CREATED      镜像的创建时间 
SIZE         镜像的大小

# 可选项
-a,--all   #列出所有镜像
-q,--quiet #只显示镜像的id
```

### docker search 搜索镜像
![](https://pic.desolatehao.top/b6468177aa88db6fa92b4cdd12ccbc46.png)
```shell
# 可选项，通过搜索过滤
--filter=STARS=3000 #搜索出的镜像就是stars超过3000的
```
### docker pull 下载镜像
![](https://pic.desolatehao.top/a947b3b550594fb2cdce0bbd7971bb75.png)
![](https://pic.desolatehao.top/3055b4ed279131c5bbdcabd148af97d4.png)
```shell
# 下载镜像 docker pull 镜像名[:tag]
yuhao@Linux:~$ docker pull redis
Using default tag: latest           # 如果不写tag就是latest
latest: Pulling from library/redis 
61320b01ae5e: Pull complete         # 分层下载 docker images的核心 联合文件系统
f8f9e5369fdd: Pull complete 
b8f8315b617a: Pull complete 
eb61abf5b105: Pull complete 
03bc4ee78aa8: Pull complete 
4f4fb700ef54: Pull complete 
93cd3c5153ab: Pull complete 
Digest: sha256:b3ad79880c88e302deb5e0fed6cee3e90c0031eb90cd936b01ef2f83ff5b3ff2 Status: Downloaded newer image for redis:latest 
docker.io/library/redis:latest     # 真实下载地址

docker pull redis
# 等价于
docker pull docker.io/library/redis:latest

# 指定下载如下
docker pull redis:7.4.3-bookworm
7.4.3-bookworm: Pulling from library/redis 
61320b01ae5e: Already exists      # 分层下载 可以使用之前下载的缓存
f8f9e5369fdd: Already exists 
5cf79f4aceb3: Pull complete 
698c8d1b3fd1: Pull complete 
601d7fdb78f5: Pull complete 
98e4482f5fee: Pull complete 
4f4fb700ef54: Pull complete 
0eeb2b86c9b7: Pull complete 
Digest: sha256:236e397c1d5ab7a94adaf1a51eec3ca8333b05fafcd6d423c6c7cc5987e519a0 Status: Downloaded newer image for redis:7.4.3-bookworm docker.io/library/redis:7.4.3-bookworm
```
![](https://pic.desolatehao.top/4ac29e517e130c01f78dd53fe0852a4e.png)
### docker rmi 删除镜像
```shell
Options: 
	-f, --force Force removal of the image  # 强制删除
	    --no-prune Do not delete untagged parents

docker rmi -f 镜像id                 # 删除指定的容器 
docker rmi -f 镜像id 镜像id 镜像id    # 删除多个容器
docker rmi -f $(docker images -aq)  # 删除全部的容器
# 也可以不使用强制删除参数
# 例如
docker rmi 90b270fb6df3
docker rmi $(docker images -aq)
```
![](https://pic.desolatehao.top/203c1cac7bafc56bf1eb2c903aabe1e7.png)

## 容器命令

前提 有镜像文件才可以创建一个容器 以下为 centos 镜像测试学习案例
`docker pull centos`
### 新建容器启动
```shell
docker run [可选参数] image

# 参数说明
--name="Name"       容器名字 tomcat0l.tomcat02,用来区分容器
-d                  后台方式运行
-it                 使用交互方式运行，进入容器查看内容

-P                  指定容器的端口 -p 8080:8080
	-p ip:主机端口：容器端口
	-p 主机端口：容器端口（常用）
	-p 容器端口
	容器端口
	
-P                  随机指定端口

# 测试启动并进入容器
yuhao@Linux:~$ docker run -it centos /bin/bash 
[root@2cdf22185264 /]# ls      # 目前已经处于容器内部
bin dev etc home lib lib64 lost+found media mnt opt proc root run sbin srv sys tmp usr var 

退出容器
[root@2cdf22185264 /]# exit
yuhao@Linux:/$ ls 
bin cdrom etc lib lib64 lost+found mnt proc run snap swapfile tmp var boot dev home lib32 libx32 media opt root sbin srv sys usr
```

### 列出所有运行的容器
```shell
# docker ps 命令  ps指 processes
	 # 列出当前正在运行的docker
-a   # 列出当前正在运行的docker + 历史运行的docker
-n=? # 显示最近创建的docker
-q   # 只显示容器的id
```
![](https://pic.desolatehao.top/8079f0e0508f1ee19bdc053ea0405c7d.png)

### 退出容器
```shell
exit          # 直接容器停止 并退出
Ctrl + Q + P  # 容器不停止 并退出
```
### 删除容器
```shell
docker rm 容器ID                   # 删除指定容器，不能删除正在运行的容器，强制删除为 rm -f
docker rm -f $(docker ps -aq)      # 删除所有的容器
docker ps -a -q | xargs docker rm  # 删除所有的容器
```
### 启动和停止容器
```shell
docker start    # 启动容器
docker stop     # 停止当前正在运行的容器
docker restart  # 重启容器
docker kill     # 强制停止当前容器
```

### 常用其他命令
### 后台启动
```shell
# 命令 docker run -d 镜像名
docker run -d centos
# 出现问题 
# docker ps 发现 centos 停止了

常见坑： docker 容器使用后台运行 就必须要有一个前台进程 docker发现没有应用就会自动停止
```
### 查看日志
```shell
docker logs

Options: 
	--details Show extra details provided to logs 
	-f, 
		--follow Follow log output 
		--since string Show logs since timestamp (e.g. "2013-01-02T13:23:37Z") or relative (e.g. "42m" for 42 minutes) 
	-n, 
		--tail string Number of lines to show from the end of the logs (default "all") 
	-t,  时间戳
		--timestamps Show timestamps 
		--until string Show logs before a timestamp (e.g. "2013-01-02T13:23:37Z") or relative (e.g. "42m" for 42 minutes)

例子

docker run -d centos /bin/sh -c "while true;do echo test;sleep 1; done"

docker ps

CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES 
2c3824b616d9 centos "/bin/sh -c 'while t…" 4 seconds ago Up 3 seconds compassionate_liskov

# 显示日志
-tf           # 显示日志
--tail $数量  # 要显示的日志条数

docker logs -tf --tail 10 2c3824b616d9
```
![](https://pic.desolatehao.top/4a3fd53f9f2df98571bc09cf053ea715.png)

### 查看容器中进程信息
```shell
docker top 容器ID

UID  PID   PPID  C STIME TTY   TIME      CMD 
root 36485 36463 0 21:12  ?   00:00:00   /bin/sh -c while true;do echo test;sleep 1; done 
root 36802 36485 0 21:16  ?   00:00:00   /usr/bin/coreutils --coreutils-prog-shebang=sleep /usr/bin/sleep 1
```
### 查看镜像源数据
```shell
docker inspect 容器ID
```
![](https://pic.desolatehao.top/7ae70b8fd9e7167da067627787501511.png)
```yaml
[
    {
        "Id": "2c3824b616d9f9bde621c17dd49bdd83a7d04e9d4726ee918c9c635e6c81571c",
        "Created": "2025-05-29T13:12:27.983824577Z",
        "Path": "/bin/sh",
        "Args": [
            "-c",
            "while true;do echo test;sleep 1; done"
        ],
        "State": {
            "Status": "running",
            "Running": true,
            "Paused": false,
            "Restarting": false,
            "OOMKilled": false,
            "Dead": false,
            "Pid": 36485,
            "ExitCode": 0,
            "Error": "",
            "StartedAt": "2025-05-29T13:12:28.041393278Z",
            "FinishedAt": "0001-01-01T00:00:00Z"
        },
        "Image": "sha256:5d0da3dc976460b72c77d94c8a1ad043720b0416bfc16c52c45d4847e53fadb6",
        "ResolvConfPath": "/var/lib/docker/containers/2c3824b616d9f9bde621c17dd49bdd83a7d04e9d4726ee918c9c635e6c81571c/resolv.conf",
        "HostnamePath": "/var/lib/docker/containers/2c3824b616d9f9bde621c17dd49bdd83a7d04e9d4726ee918c9c635e6c81571c/hostname",
        "HostsPath": "/var/lib/docker/containers/2c3824b616d9f9bde621c17dd49bdd83a7d04e9d4726ee918c9c635e6c81571c/hosts",
        "LogPath": "/var/lib/docker/containers/2c3824b616d9f9bde621c17dd49bdd83a7d04e9d4726ee918c9c635e6c81571c/2c3824b616d9f9bde621c17dd49bdd83a7d04e9d4726ee918c9c635e6c81571c-json.log",
        "Name": "/compassionate_liskov",
        "RestartCount": 0,
        "Driver": "overlay2",
        "Platform": "linux",
        "MountLabel": "",
        "ProcessLabel": "",
        "AppArmorProfile": "docker-default",
        "ExecIDs": null,
        "HostConfig": {
            "Binds": null,
            "ContainerIDFile": "",
            "LogConfig": {
                "Type": "json-file",
                "Config": {}
            },
            "NetworkMode": "bridge",
            "PortBindings": {},
            "RestartPolicy": {
                "Name": "no",
                "MaximumRetryCount": 0
            },
            "AutoRemove": false,
            "VolumeDriver": "",
            "VolumesFrom": null,
            "ConsoleSize": [
                43,
                141
            ],
            "CapAdd": null,
            "CapDrop": null,
            "CgroupnsMode": "private",
            "Dns": [],
            "DnsOptions": [],
            "DnsSearch": [],
            "ExtraHosts": null,
            "GroupAdd": null,
            "IpcMode": "private",
            "Cgroup": "",
            "Links": null,
            "OomScoreAdj": 0,
            "PidMode": "",
            "Privileged": false,
            "PublishAllPorts": false,
            "ReadonlyRootfs": false,
            "SecurityOpt": null,
            "UTSMode": "",
            "UsernsMode": "",
            "ShmSize": 67108864,
            "Runtime": "runc",
            "Isolation": "",
            "CpuShares": 0,
            "Memory": 0,
            "NanoCpus": 0,
            "CgroupParent": "",
            "BlkioWeight": 0,
            "BlkioWeightDevice": [],
            "BlkioDeviceReadBps": [],
            "BlkioDeviceWriteBps": [],
            "BlkioDeviceReadIOps": [],
            "BlkioDeviceWriteIOps": [],
            "CpuPeriod": 0,
            "CpuQuota": 0,
            "CpuRealtimePeriod": 0,
            "CpuRealtimeRuntime": 0,
            "CpusetCpus": "",
            "CpusetMems": "",
            "Devices": [],
            "DeviceCgroupRules": null,
            "DeviceRequests": null,
            "MemoryReservation": 0,
            "MemorySwap": 0,
            "MemorySwappiness": null,
            "OomKillDisable": null,
            "PidsLimit": null,
            "Ulimits": [],
            "CpuCount": 0,
            "CpuPercent": 0,
            "IOMaximumIOps": 0,
            "IOMaximumBandwidth": 0,
            "MaskedPaths": [
                "/proc/asound",
                "/proc/acpi",
                "/proc/interrupts",
                "/proc/kcore",
                "/proc/keys",
                "/proc/latency_stats",
                "/proc/timer_list",
                "/proc/timer_stats",
                "/proc/sched_debug",
                "/proc/scsi",
                "/sys/firmware",
                "/sys/devices/virtual/powercap"
            ],
            "ReadonlyPaths": [
                "/proc/bus",
                "/proc/fs",
                "/proc/irq",
                "/proc/sys",
                "/proc/sysrq-trigger"
            ]
        },
        "GraphDriver": {
            "Data": {
                "ID": "2c3824b616d9f9bde621c17dd49bdd83a7d04e9d4726ee918c9c635e6c81571c",
                "LowerDir": "/var/lib/docker/overlay2/f1d5003c90ccb9f121a03be02ca108f1e147835c5c8fa7a9756de43d94dca43f-init/diff:/var/lib/docker/overlay2/472a3902444bfceec351175dfad644f970924694122ba1e71d8515e07e61b120/diff",
                "MergedDir": "/var/lib/docker/overlay2/f1d5003c90ccb9f121a03be02ca108f1e147835c5c8fa7a9756de43d94dca43f/merged",
                "UpperDir": "/var/lib/docker/overlay2/f1d5003c90ccb9f121a03be02ca108f1e147835c5c8fa7a9756de43d94dca43f/diff",
                "WorkDir": "/var/lib/docker/overlay2/f1d5003c90ccb9f121a03be02ca108f1e147835c5c8fa7a9756de43d94dca43f/work"
            },
            "Name": "overlay2"
        },
        "Mounts": [],
        "Config": {
            "Hostname": "2c3824b616d9",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/bin/sh",
                "-c",
                "while true;do echo test;sleep 1; done"
            ],
            "Image": "centos",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": {
                "org.label-schema.build-date": "20210915",
                "org.label-schema.license": "GPLv2",
                "org.label-schema.name": "CentOS Base Image",
                "org.label-schema.schema-version": "1.0",
                "org.label-schema.vendor": "CentOS"
            }
        },
        "NetworkSettings": {
            "Bridge": "",
            "SandboxID": "414ac89b025372e0e21fb50494e1f00110b9022cdf7826e2d0b72c92499edb7b",
            "SandboxKey": "/var/run/docker/netns/414ac89b0253",
            "Ports": {},
            "HairpinMode": false,
            "LinkLocalIPv6Address": "",
            "LinkLocalIPv6PrefixLen": 0,
            "SecondaryIPAddresses": null,
            "SecondaryIPv6Addresses": null,
            "EndpointID": "1e527de4cd5432c9f2b625060f25cdb423e427b32c2cf662c05fc7f0b853efdb",
            "Gateway": "172.17.0.1",
            "GlobalIPv6Address": "",
            "GlobalIPv6PrefixLen": 0,
            "IPAddress": "172.17.0.2",
            "IPPrefixLen": 16,
            "IPv6Gateway": "",
            "MacAddress": "ce:ea:20:d5:08:bd",
            "Networks": {
                "bridge": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": null,
                    "MacAddress": "ce:ea:20:d5:08:bd",
                    "DriverOpts": null,
                    "GwPriority": 0,
                    "NetworkID": "a398265601bc73eba3b4845a0d3884e5a0a6320bcae0747f72aeef317ca9c086",
                    "EndpointID": "1e527de4cd5432c9f2b625060f25cdb423e427b32c2cf662c05fc7f0b853efdb",
                    "Gateway": "172.17.0.1",
                    "IPAddress": "172.17.0.2",
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "DNSNames": null
                }
            }
        }
    }
]
```

### 进入当前正在运行的容器
```shell
# 我们通常使用容器都是使用后台方式运行 需要进入容器 修改一些配置

# 命令
docker exec -it 容器ID /bin/bash
```
![](https://pic.desolatehao.top/2a0436e6aea8b96496a45d1f6407437d.png)
```shell
# 方法二
docker attach 容器ID
……输出在执行的代码

区别
docker exec   # 进入后重启启动一个终端 可以在里面正常操作
docker attach # 进入容器正在执行的终端 不会启动新的终端
```
### 容器内文件复制到主机
```shell
docker cp 容器ID 

# 例如
docker cp 2c3824b616d9:/home/test.txt /home/yuhao/

将容器2c3824b616d9的/home/test.txt文件复制到主机的/home/yuhao/目录下
```
![](https://pic.desolatehao.top/030fe0cef807e13f487d15777b93f7b7.png)

拷贝是一个手动过程 后期使用 -v 卷的技术实现持续化同步目录

## 总结
### 命令结构
![](https://pic.desolatehao.top/dd9d1c1aabd3284a22b9e433ace030c7.png)

### 测试实验

#### nginx
  test-1
```shell
docker run -d -p 1987:80 --name nginx01 nginx

注意 --name 参数在镜像名称之前
不能写成如下情况
XXX docker run nginx -d --name nginx01 -p 1987:80 

curl localhost:80  成功
```
#### tomcat
 test-2
```shell
docker run -d -p 1988:8080 --name tomcat01 tomcat
因为镜像源提供的tomcat镜像极其的微小所以访问首页的时候是404，需要复制一些默认文件
docker exec -it tomcat01 /bin/bash
cp -r webapps.dist/* webapps/

测试
curl localhost:8080  成功
```

#### elasticsearch与kibana
 test-3
```shell
docker network create elastic-net
创建单独子网

docker run -d --name elasticsearch --network elastic-net -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" docker.elastic.co/elasticsearch/elasticsearch:7.6.2

限制内存
`-Xms512m` 表示 JVM 启动时至少分配 512 兆字节的堆内存
`-Xmx512m` 表示 JVM 最多可以使用 512 兆字节的堆内存

docker run -d --name kibana --network elastic-net -p 5601:5601 -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" docker.elastic.co/kibana/kibana:7.6.2

查看地址用docker inspect {dockername}
```

## 可视化
### portainer
```shell
docker run -d -p 8088:9000 --restart=always -v /var/run/docker.sock:/var/run/docker.sock --privileged=true portainer/portainer
```
`--restart=always`
- 如果容器因为任何原因停止（例如，应用程序崩溃，或者手动停止），Docker 会尝试重启它

`-v /var/run/docker.sock:/var/run/docker.sock`
- 通过将宿主机的 `docker.sock` 挂载到容器内部相同的路径，Portainer 容器内的应用程序就能够通过这个 socket 文件与宿主机的 Docker 守护进程进行通信，从而实现对宿主机上 Docker 引擎的 **管理和控制**（例如，创建、启动、停止、删除容器、镜像、网络等）

`--privileged=true`
- 当一个容器以特权模式运行时，它几乎拥有了与宿主机相同的权限。它绕过了大多数内核安全机制，可以访问所有设备文件、修改内核参数、加载内核模块等。
- 在 Portainer 的场景中，`--privileged=true` 提供了更深层次的权限，有时是为了确保 Portainer 能够执行一些需要更高权限的操作，例如在某些宿主机上管理存储卷或网络驱动

访问8088
![](https://pic.desolatehao.top/e757af0dd663a2a71de3e136cf254a93.png)
