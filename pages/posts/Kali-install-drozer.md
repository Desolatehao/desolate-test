---
title: Kali安装drozer并连接至物理机
lang: zh
Date: 2025-01-16
---
## 环境准备：


	1.kali虚拟机-kali-linux-2024.3-installer-amd64
	2.pipx
	3.drozer-3.1.0-py3-none-any.whl
	4.drozer-agent-3.1.0.apk

下载地址：

kali-iso   
https://kali.download/base-images/kali-2024.3/kali-linux-2024.3-installer-amd64.iso

drozer介绍地址   
https://github.com/WithSecureLabs/drozer

drozer-3.1.0-py3-none-any.whl   
https://github.com/WithSecureLabs/drozer/releases/download/3.1.0/drozer-3.1.0-py3-none-any.whl

drozer-agent-3.1.0.apk   
https://github.com/WithSecureLabs/drozer-agent/releases/download/3.1.0/drozer-agent.apk


备用链接   
https://pan.baidu.com/s/1b-wtJSc1x52PLylLpks2ZA?pwd=facr
## 一、kali换源

```
vim /etc/apt/sources.list
按下i进入编辑模式 注释第二行 光标移至最下面换行 粘贴阿里源

# aliyun 阿里云
deb http://mirrors.aliyun.com/kali kali-rolling main non-free contrib
deb-src http://mirrors.aliyun.com/kali kali-rolling main non-free contrib

按下Esc 输入wq! 回车保存

更新
apt-get update
```

![](https://pic.desolatehao.top/3ee2f519503e88d6bb4c0a816d145ad3.png)
## 二、安装pipx

pip 和 pipx 都是 Python 包管理工具，pip安装会影响全局环境，pipx可以创建虚拟环境来隔离相互依赖。

- **`pip`**：是 Python 的标准包管理工具，用于安装、升级和卸载 Python 包。`pip` 会将包安装到当前 Python 环境（通常是全局环境或虚拟环境）中。
- **`pipx`**：是用于安装和运行 Python 应用程序的工具。与 `pip` 不同，`pipx` 专门用于安装独立的 Python 应用程序（通常是 CLI 工具），并将它们隔离到独立的虚拟环境中，避免包之间的冲突。
```
sudo apt install pipx
pipx ensurepath

安装过程中也许会遇到 以下界面 不必理会 直接找到底部的ok 回车即可
Which services should be restarted? 
[]lightdm.service 
[]NetworkManager.service 
[*]open-vm-tools.service 
[*]systemd-journald.service 
[]systemd-logind.service 
[*]systemd-manager 
[*]systemd-timesyncd.service 
[*]systemd-udevd.service 
[*]udisks2.service 
[*]upower.service

加入环境变量
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

验证
pipx --version

然后重启 
reboot
```

## 三、安装drozer

安装adb   
```
sudo apt-get install android-tools-adb   
adb version # 验证安装成功
```

安装完成后，我们可以开始使用ADB来连接Android设备。

需要在Android设备的设置中打开USB调试模式，并通过USB线将设备连接到计算机。

在终端中输入以下命令（手机弹窗，信任设备，同意调试）列出所有已连接的Android设备   
`adb devices`   

![](https://pic.desolatehao.top/e78b6e7e396a5079464f711c350f28c0.png)

手机安装drozer-agent-3.1.0.apk，注意手机安装版本需要与kali安装的drozer相互对应上，不然可能会出现链接不上的情况


下载drozer-3.1.0-py3-none-any.whl文件 复制到虚拟机
* 注意 此项需要确认在何种模式下 普通用户还是root用户，他们会相互隔离，之后也需要在同样的权限框下运行   

```
pipx install ./drozer-3.1.0-py3-none-any.whl
```

## 四、连接

手机启动 drozer-Agent 点击底部 Embedded Server 开启服务

adb forward tcp:31415 tcp:31415   
弹出31415 即为成功

drozer console connect

如果出现以下界面，Congratulations！

![](http://pic.desolatehao.top/202501161134805.png)

```
如果未响应，或者之后有错误，可以用以下来重启
adb kill-server
adb start-server
```

