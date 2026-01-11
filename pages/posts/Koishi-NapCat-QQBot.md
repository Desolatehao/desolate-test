---
title: 基于Koishi+NapCat的NTQQ机器人搭建
lang: zh
date: 2025-02-16
type: note
---

> 注意本文只做个人记录使用，其中涉及地址链接不保证有效性
> **未经desolatehao'Blog同意,禁止转载,转载时需要标明desolatehao'Blog**

本文主要实现的是原神鸣潮等游戏的自动化插件，当然基于Koishi社区也可以玩其他的插件尽可探索有趣的插件

我们的目标是 在QQ中发送指令 得到机器人QQ的回复 并完成指定的自动化任务

需要实现 QQ平台+对接平台+功能插件

# 平台选择

QQ官方有自身的QQ机器人平台，推荐使用官方机器人，使用第三方QQ平台会面临QQ账号风控的情况，慎用，慎用

本文采用第三方NTQQ+koishi+GsCore实现

## NapCatQQ

现代化的基于 NTQQ 的 Bot 协议端实现，文档地址 https://www.napcat.wiki/

### 优点

1.开箱即用-多种部署方式，快捷部署于 Windows/Linux/macOS 等主流 x64 架构平台。

2.内存轻量-天生无头，不依赖框架加载，不依赖 Electron，内存占用低至 50~100 MB。

(实际感觉绝对不止100MB 😀)

3.适配快速-采取 Core/Adapter 架构，支持多种 Bot 协议，快速迁移。

### 安装

```
curl -o napcat.sh https://nclatest.znin.net/NapNeko/NapCat-Installer/main/script/install.sh && sudo bash napcat.sh --tui
```

![| 500](https://pic.desolatehao.top/8cd3508d3ea0c7367ae5e0b6b47beac3.png)
选择shell安装，安装cli，我这里已经安装过了所以比较快
![](https://pic.desolatehao.top/cce3bbc40190bbe986d6199924bc599d.png)
![](https://pic.desolatehao.top/9998ac1d9b9ff2329fc29f047d1e423c.png)
以下为常用的指令集

```
输入 xvfb-run -a qq --no-sandbox 命令启动。
保持后台运行 请输入 screen -dmS napcat bash -c "xvfb-run -a qq --no-sandbox"
后台快速登录 请输入 screen -dmS napcat bash -c "xvfb-run -a qq --no-sandbox -q QQ号码"
Napcat安装位置 /opt/QQ/resources/app/app_launcher/napcat
WEBUI_TOKEN 请自行查看/opt/QQ/resources/app/app_launcher/napcat/config/webui.json文件获取
停止后台运行 请输入 screen -S napcat -X quit

注意, 您可以随时使用 screen -r napcat 来进入后台进程并使用
ctrl + a + d 离开(离开不会关闭后台进程)。
```

### 登陆

输入 `xvfb-run -a qq --no-sandbox` 扫码登陆
![](https://pic.desolatehao.top/ccc8b99b77833bd18bd3a9575c52ecfc.png)

登陆成功后留意命令行中的

```
[NapCat] [WebUi] WebUi Local Panel Url:
http://127.0.0.1:6099/webui?token=？？？
```

保存好自己的token，游览器进入http://IP:6099/webui，输入你的token

![](https://pic.desolatehao.top/e2ea5b70d3c2b450edd6b086ba538985.png)
![](https://pic.desolatehao.top/c219ab0536f7d4e16e7a46521d77417f.png)

`太粉了 严重怀疑开发者是一位优雅的小姐姐`
点击网络配置 选择新建WS客户端 配置如下
![](https://pic.desolatehao.top/8fc81b6b8825378ab9816944f8e202b5.png)
注意 这里的URL：`ws://127.0.0.1:5140/onebot` 是用于与Koishi平台链接

### 后台运行

命令行 Ctrl + c 退出

```
输入
screen -dmS napcat bash -c "xvfb-run -a qq --no-sandbox"
screen -r napcat 进入后台
扫码登入
ctrl + a + d 离开(离开不会关闭后台进程)。
```

### 维护

长期运行时可能会出现QQ未反应或者未链接上的情况，恭喜你，风控了😀，手机登陆对应QQ后寻找风控警告，根据官方解封方法解封(很简单一分钟就搞定了)，之后按照以下来进行重新登陆，仅比后台运行多了一步退出screen

```
输入
screen -S napcat -X quit
screen -dmS napcat bash -c "xvfb-run -a qq --no-sandbox"
screen -r napcat 进入后台
扫码登入
ctrl + a + d 离开(离开不会关闭后台进程)。
```

## Koishi

创建跨平台、可扩展、高性能的机器人，官网地址 https://koishi.chat/zh-CN/

### 优点

1.Web仪表盘使用方便简洁

2.社区插件安装配置简单

3.沙盒便于测试

### 安装

我的环境是家里云，安装了1panel进行简单管理，如果你也安装了可以直接去应用商店去安装，当然Koishi提供了多种安装方式 参考 https://koishi.chat/zh-CN/manual/starter/docker.html

以下为1panel的安装处理

安装Koishi需要数据库支撑，这里选择Maria DB-10.11.9 无他，在仅支持mariadb与mysql中内存占用最小的一个，无需修改默认设置，选择版本直接安装

![](https://pic.desolatehao.top/7a1926c62c2c16900a07bbe047392c9d.png)

商店搜索koishi，点击安装，选择数据库本地，其他设置都是默认的，注意端口是否是5140
![](https://pic.desolatehao.top/80bbb7a2d4ee7e43021eaedbac94405a.png)

### 配置

#### 控制台配置

游览器访问 http://ip:15140/

![](https://pic.desolatehao.top/1547610eec22e3d76bc8f604dc042159.png)

同不同意都行，点击插件设置，找到console-auth，设置你的koishi管理平台账号密码，点击保存，点击运行（按钮在右上角）

![](https://pic.desolatehao.top/27635a3b014268c5a1523c64ecf3fb65.png)

重新进入控制台，输入账号密码登陆

![](https://pic.desolatehao.top/1c1a1e22609729b70f8942579206f351.png)

#### 连接QQ

搜索adapter-onebot 安装
![](https://pic.desolatehao.top/2d4f048a1796063ebeefc26a5e3f91bd.png)

先点击左侧栏的「依赖管理」，之后点击右上角的「火箭」按钮，将 Koishi 更新至最新版本
![](https://pic.desolatehao.top/65fbd9306c24ca925f166cd992bb2919.png)

再次搜索adapter-onebot 点击修改，进入插件配置界面

机器人账号为NapCat登陆的QQ号，协议选择ws-reverse，路径为 /onebot ，点击保存，启动
![](https://pic.desolatehao.top/3fbec8889caf7dd060be824cd357470d.png)

右下角查看状态

![](https://pic.desolatehao.top/16e30349404830de3a03a0da866e7f50.png)

如果是绿色灯，你的koishi就连接上你的QQ啦

对机器人qq输入status，如果出现以下回复就是成功了

![](https://pic.desolatehao.top/8fca2370ddb8b51a2da1b747e13a29b4.png)

到此为止koishi连接QQ已经成功，插件市场更多的功能等着你发现

## GsCore(可选)

目的：安装原神鸣潮等插件

选择GsCore作为插件平台 官网 https://docs.sayu-bot.com/

安装文档参考 https://docs.sayu-bot.com/Started/EnvCheck.html

### 环境

`Python`环境（版本须`>3.8`， 建议`>=3.12`，不建议`>=3.13`）

`git`环境

`poetry`(版本须`>=1.4.0`)或者`pdm`或者`uv`（建议使用`uv`）

```
apt install python3
sudo ln -s /usr/bin/python3 /usr/bin/python
验证
python --version

验证
git -v

安装pipx管理
apt install pipx
pipx ensurepath

安装uv
pipx install uv -i https://pypi.tuna.tsinghua.edu.cn/simple
pipx ensurepath
source ~/.bashrc
uv -V
```

### 安装

下载

```
git clone https://github.com/Genshin-bots/gsuid_core.git --depth=1 --single-branch
```

进入文件夹

```
cd gsuid_core
```

注：如果下载失败 访问 https://ghproxy.link/ 寻找最新的git加速地址，本篇编写时可用为 https://ghfast.top ，即可把上述下载地址转化为

```
git clone https://ghfast.top/https://github.com/Genshin-bots/gsuid_core.git --depth=1 --single-branch
```

安装依赖(uv环境)

```
uv sync
uv run python -m ensurepip
```

配置gscore

参考 https://docs.sayu-bot.com/Started/CoreConfig.html

修改gsuid_core/data/config.json 文件，修改"HOST"与"masters"字段值，保存

### 启动&koishi连接

```
uv run core
```

然后转到koishi插件市场，搜索gscore-adapter，安装，进入配置界面

机器人ID随便取，主机地址需要填写自身的IP(如果是服务器写服务器地址)，端口选择8765，ws路径为ws，http路径为genshinuid，保存启动

![](https://pic.desolatehao.top/ce1e3e770789b83f4d287f2c650d7fd0.png)

此时你的koishi就连接上你的GsCore了，沙箱或者qq测试 core帮助，返回下图即成功

![](https://pic.desolatehao.top/0c8e8808e51264a22aa5143e7146ea20.png)

后续的相关配置参考 https://docs.sayu-bot.com/Started/CoreConfig.html

进入GsCore控制台 参考 https://docs.sayu-bot.com/Advance/WebConsole.html

## 参考地址

NapCat 安装 https://www.napcat.wiki/guide/install

Koishi 安装 https://forum.koishi.xyz/t/topic/810
