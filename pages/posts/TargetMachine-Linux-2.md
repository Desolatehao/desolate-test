---
title: 知攻善防-Linux应急响应靶机-2
Date: 2025-04-02
---
靶场地址 https://mp.weixin.qq.com/s/7PZGTD0GXaJLYZ62k9GB4w  
[答案](https://mp.weixin.qq.com/s?__biz=MzkxMTUwOTY1MA==&mid=2247485704&idx=1&sn=2fbcaae9954ac422052903b9de0343ea&chksm=c11a58f5f66dd1e37953b92ad464b3794a2e8019ad30ce8d3b4342ab725dbc4399330d038cfd&scene=21#wechat_redirect)

前景需要：看监控的时候发现webshell告警. 领导让你上机检查你可以救救安服仔吗！！

### 需求
1. 提交攻击者IP
2. 提交攻击者修改的管理员密码(明文)
3. 提交第一次Webshell的连接URL( xxx.xxx.xxx.xx/abcdefg?abcdefg 只需要提交abcdefg?abcdefg)
4. 提交Webshell连接密码
5. 提交数据包的flag1
6. 提交攻击者使用的后续上传的木马文件名称
7. 提交攻击者隐藏的flag2
8. 提交攻击者隐藏的flag3

`root/Inch@957821.`

虚拟机中安装了宝塔 
使用bt修改默认密码
```
bt
5
输入新密码

bt
14
查看登陆地址
```
![](https://pic.desolatehao.top/0710c957ad06fd4ad60c657de5584f72.png)
![](https://pic.desolatehao.top/ca6300715eb0c17b9d73b49fea238f0b.png)



进入宝塔管理面板后直接查看网站日志
192.168.20.1
![](https://pic.desolatehao.top/5ce4d296cde2e5e0c5ff980b8e9985b5.png)


疑似后门 version2.php
![](https://pic.desolatehao.top/102b1ab65c4032958fe1646abedd4ce6.png)

![](https://pic.desolatehao.top/21df43c2da20be77f26089734aadac36.png)

## 管理员密码
数据库user表中找到管理员用户
![](https://pic.desolatehao.top/3f12d7cb86d048e6a1975817d66b3b6f.png)
由于需要明文这里需要去代码看加密流程倒推    
发现就是简单的MD5加密 去 https://www.somd5.com/ 解密

![](https://pic.desolatehao.top/d257c29c140ead39dda776c48fd9813b.png)
![](https://pic.desolatehao.top/a65d86a16555c6b41588869faf216017.png)
![](https://pic.desolatehao.top/b0970075d2f696ada0447c816dcacf57.png)
## 连接密码
数据库搜eval 找到连接密码
![](https://pic.desolatehao.top/d3609b1f4732d38ad70334e602f8a957.png)

寻找发现是 index.php?user-app-register 功能点



## Flag
在root目录下发现流量包   
`flag1{Network@_2020_Hack}`
![](https://pic.desolatehao.top/8d013048dbfb1875270c849e63eab6db.png)

找到version2.php后门流量数据包 
![](https://pic.desolatehao.top/3e8b53fc9b3d1eb915543e3ef1329006.png)

wireshark显示编码改为ASCII

这里给出一段解密流量包

![](https://pic.desolatehao.top/e88e172f9c58e9439948492b3489e075.png)
![](https://pic.desolatehao.top/7cbe078e5c03215373f4e9029ac7b418.png)
发送包解密代码可自行查看，返回包解密
![](https://pic.desolatehao.top/45eb18f231af943bb912efafa365d3cc.png)

/www/wwwroot/127.0.0.1/.api/alinotify.php 发现flag   
flag2=flag{bL5Frin6JVwVw7tJBdqXlHCMVpAenXI9In9}
![](https://pic.desolatehao.top/b4efb15e6b89db05967d52d1646175ec.png)

env发现flag   
flag3=flag{5LourqoFt5d2zyOVUoVPJbOmeVmoKgcy6OZ}
![](https://pic.desolatehao.top/a7aec182cc1eb1d0ca75ed07ef492b97.png)

## 总结

1. 提交攻击者IP   
	192.168.20.1

2. 提交攻击者修改的管理员密码(明文)   
	Network@2020

3. 提交第一次Webshell的连接URL   
	index.php?user-app-register

4. 提交Webshell连接密码   
	Network2020

5. 提交数据包的flag1   
	`flag1{Network@_2020_Hack}`

6. 提交攻击者使用的后续上传的木马文件名称   
	version2.php

7. 提交攻击者隐藏的flag2   
	flag{bL5Frin6JVwVw7tJBdqXlHCMVpAenXI9In9}   

8. 提交攻击者隐藏的flag3   
	flag{5LourqoFt5d2zyOVUoVPJbOmeVmoKgcy6OZ}