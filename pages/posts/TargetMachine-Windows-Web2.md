---
title: 知攻善防-Windows应急响应靶机-Web2
lang: zh
Date: 2025-03-28
---
靶场地址 https://mp.weixin.qq.com/s/7PZGTD0GXaJLYZ62k9GB4w

Windows应急响应靶机 - Web2

前景需要：

小李在某单位驻场值守，深夜12点，甲方已经回家了，小李刚偷偷摸鱼后，发现安全设备有告警，于是立刻停掉了机器开始排查。

`Administrator`  `Zgsf@qq.com`

这是他的服务器系统，请你找出以下内容，并作为通关条件：
1. 攻击者的IP地址（两个）？
2. 攻击者的webshell文件名？  
3. 攻击者的webshell密码？  
4. 攻击者的伪QQ号？
5. 攻击者的伪服务器IP地址？
6. 攻击者的服务器端口？
7. 攻击者是如何入侵的（选择题）？  
8. 攻击者的隐藏用户名？

## 排查过程

一样的PHP study 找到中间件apache的日志 发现目录扫描
![](https://pic.desolatehao.top/df8c2ece1e8d130a60cfa4e2cc00be72.png)
这里发现攻击IP 192.168.126.135 
![](https://pic.desolatehao.top/899214b484ac50e7bc4ffa25d4a1047a.png)
发现上传后门 用D盾扫描也是一样的结果 确认为后门文件 system.php 
![](https://pic.desolatehao.top/a9ae1d6e7d3be572fdd065b92a9d4641.png)
webshell密码为 hack6618 

根据原网站目录结构 判断为word press网站

发现影子账号 hack887$

2024-02-29 13:27:11	hack887$	WIN-RRCVI68HLRI	Administrator	WIN-RRCVI68HLRI

![](https://pic.desolatehao.top/99b76c9b4a3c542014f709ad09c450c0.png)

锁定时间 2024-02-29 13:27:11附近发现登陆日志 IP为192.168.126.129
![](https://pic.desolatehao.top/950c46d54de13a10c195f6692bec5528.png)
远程桌面日志也能发现
![](https://pic.desolatehao.top/c27f00bcc01b430ac86c008bc914f90e.png)

![](https://pic.desolatehao.top/5210f2553b12a8ec4578dd3bc6f47aa5.png)

从时间上来看 这里攻击者已经找到漏洞点 开始攻击 

通过 %UserProfile%\Recent 找到最近修改的文件

发现 frp 还有qq文件夹

![](https://pic.desolatehao.top/e7281072880acc1b52f269487f597169.png)
qq号为777888999321
![](https://pic.desolatehao.top/2091d10f8628d67c3134c6af832e974a.png)

发现FRP 远程连接配置文件 IP 256.256.66.88 Port 65536
![](https://pic.desolatehao.top/159b72a0ec71a79d21c0081cf9b2e7af.png)

FTP日志 发现大量爆破日志
![](https://pic.desolatehao.top/7322ffc526e6c9ad02419313e50bb2c0.png)
![](https://pic.desolatehao.top/3ab15ce8f9a62252c096d38fab4798a1.png)
![](https://pic.desolatehao.top/94df038516af35edcd7fce540a69bdaf.png)
发现上传后门

## 入侵日志总结

网站目录扫描

FTP账号密码爆破（成功）

通过ftp上传Webshell 

webshell连接后提权 创建账号hack887$ 


1. 攻击者的IP地址（两个）？  
	192.168.126.135 扫描目录
	192.168.126.129 登陆影子账号
2. 攻击者的webshell文件名？  
	system.php 
3. 攻击者的webshell密码？  
	 hack6618 
4. 攻击者的伪QQ号？  
	777888999321
5. 攻击者的伪服务器IP地址？  
	 IP 256.256.66.88 
6. 攻击者的服务器端口？  
	Port 65536
7. 攻击者是如何入侵的（选择题）？    
	FTP爆破成功 然后上传的Webshell
8. 攻击者的隐藏用户名？  
	hack887$ 