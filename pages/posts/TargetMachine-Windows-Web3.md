---
title: 知攻善防-Windows应急响应靶机-Web3
lang: zh
date: 2025-03-28
---
靶场地址 https://mp.weixin.qq.com/s/7PZGTD0GXaJLYZ62k9GB4w

Windows应急响应靶机 - Web3

前景需要：

小苕在省护值守中，在灵机一动情况下把设备停掉了，甲方问：为什么要停设备？小苕说：我第六感告诉我，这机器可能被黑了。  

这是他的服务器，请你找出以下内容作为通关条件：  

1. 攻击者的两个IP地址
2. 隐藏用户名称
3. 黑客遗留下的flag【3个】

本虚拟机的考点不在隐藏用户以及ip地址，仔细找找把。

`Windows:administrator/xj@123456`
## 排查过程

刚启动就发现 hack6618$
![](https://pic.desolatehao.top/009a8d87334454b3e9720d125943fa8d.png)

apache日志

192.168.75.129 cmd.php 后门

![](https://pic.desolatehao.top/a1cef9f36491959137b2b642f602d692.png)
192.168.75.130
![](https://pic.desolatehao.top/f86cd78620f3129e7ee75d2476df5211.png)

检查计划任务发现
flag{zgsfsys@sec}
![](https://pic.desolatehao.top/3b050e5c840b0aba6b14a0997b9bf03f.png)

找到文件 flag{888666abc} 
![](https://pic.desolatehao.top/8340bd0168e63b7e2977588d8cbbf307.png)

找到登陆IP 192.168.75.130
![](https://pic.desolatehao.top/ed8a759dfb01a7b871134a7a499aaac1.png)

实在是找不到第三个flag了，最后从网站本身出发，我的想法是直接去找数据库信息

	官方写的wp为 进网站 用一个nologin去看hack用户信息

启动mysql之后 在C:\Windows\System32\cmd.exe 运行mysql -u root -p 

然后再用数据库管理工具翻数据库

发现异常账号Hacker 找到字段 mem_Intro flag{H@Ck@sec}
![](https://pic.desolatehao.top/ee7c219876946079d32e57e6e6cb30f5.png)
![](https://pic.desolatehao.top/5a1492532651929e8e1fecc61825376f.png)

答案
1. 攻击者的两个IP地址      
	192.168.75.129 192.168.75.130
2. 隐藏用户名称      
	hack6618$
3. 黑客遗留下的flag【3个】      
	flag{zgsfsys@sec}
	flag{888666abc} 
	flag{H@Ck@sec}

## 总结

找到影子账号之后 要继续排查其操作日志 自动化任务

对于搭建的网站也要进行排查 如数据库内容 查看数据库记录
