---
title: 知攻善防-Windows应急响应靶机-Web1
Date: 2025-03-28
---
靶场地址 https://mp.weixin.qq.com/s/7PZGTD0GXaJLYZ62k9GB4w

Windows应急响应靶机 - Web1

前景需要：

小李在值守的过程中，发现有CPU占用飙升，出于胆子小，就立刻将服务器关机，这是他的服务器系统，请你找出以下内容，并作为通关条件：

1. 攻击者的shell密码
2. 攻击者的IP地址
3. 攻击者的隐藏账户名称
4. 攻击者挖矿程序的矿池域名

用户：administrator 密码：`Zgsf@admin.com`

## 攻击者的shell密码
D盾查杀web目录 C:\phpstudy_pro\WWW 发现后门
C:\phpstudy_pro\WWW\content\plugins\tips\shell.php
![](https://pic.desolatehao.top/4ed7f366b06dcc9205b16df65d4dc348.png)

验证rebeyond MD5值前16位，确认后门密码为 rebeyond
```
e45e329feb5d925b a3f549b17b4b3dde 
```

## 攻击者的IP地址
找到中间件为Apache
![](https://pic.desolatehao.top/9d1098a47bcdf0f13fdaa4ac0c7101c3.png)

查看日志，关注文件/log/access.log 定位到shell.php 涉及ip为192.168.126.1
![](https://pic.desolatehao.top/193815877cab8bf43aad21bda9030fea.png)

## 攻击者的隐藏账户名称
查找所有用户和管理员权限用户

```
net user
net localgroup Administrators  
```

发现隐藏账户 hack168$
![](https://pic.desolatehao.top/b294a35a52050af4c0070527540cfe3a.png)

## 攻击者挖矿程序的矿池域名

虚拟机开启之后并未发现出现异常程序的情况 所以转而直接去寻找异常文件

这里可以选择使用杀软全盘查杀，但是本题可以直接去hack168用户文件夹的桌面发现了挖矿程序
kuang.exe
![](https://pic.desolatehao.top/e2a59812128f7a9894ee4789ed90e708.png)

该图标为pyinstaller打包，使用pyinstxtractor进行反编译

https://github.com/extremecoders-re/pyinstxtractor

得到pyc文件后在去在线反编译得到源码
![](https://pic.desolatehao.top/f14952de0dbc3ee3013b58b36d5f53f7.png)
得到地址
wakuang.zhigongshanfang.top

## 总结

看见Apache日志里有很多url编码的路径 就觉得是有些命令执行什么的 其实根本就不是

虚拟机打开之后并系统占用很低 同时未发现异常程序 此时思路就应该迅速转变到寻找上传文件

这也是第一个靶机 思路转变比较缓慢 后续强化检查流程