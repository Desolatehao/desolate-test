---
title: 知攻善防-Linux应急响应靶机-1
lang: zh
date: 2025-04-02
---
靶场地址 https://mp.weixin.qq.com/s/7PZGTD0GXaJLYZ62k9GB4w

前景需要：小王急匆匆地找到小张，小王说"李哥，我dev服务器被黑了",快救救我！！

挑战内容：
黑客的IP地址
遗留下的三个flag  

注意：  
该靶机有很多非预期解，做靶机是给自己做，请大家合理按照预期解进行探索。

相关账户密码：
defend/defend  
root/defend

打开命令行 使用history发现第一个flag 并且涉及了/etc/rc.d/rc.local文件
flag{thisismybaby}
![](https://pic.desolatehao.top/8b056f49e0f29d96a4604be2a8b862dc.png)
```shell
root@localhost dev]# history
    1  ls
    2  chmod +x /etc/rc.d/rc.local
    3  cat /etc/rc.d/rc.local
    4  vim /etc/rc.d/rc.local 
    5  echo flag{thisismybaby}
```
发现flag
flag{kfcvme50}
![](https://pic.desolatehao.top/18da51970662ee592be11df8edfeff04.png)

用cat /etc/passwd 发现创建用户后搭建的redis
![](https://pic.desolatehao.top/cc699f6ef1f12866f75bafd00f745dd2.png)
/etc/redis.conf 发现flag
flag{P@ssW0rd_redis}
![](https://pic.desolatehao.top/5b91ffffdc1cdfa8d5ebeed8e8f24fda.png)

查看redis的日志记录等级
`cat /etc/redis.conf | grep loglevel`
![](https://pic.desolatehao.top/f48eb709370e5bf9d618f405d6b97225.png)

直接查看连接成功的情况
`cat /var/log/redis/redis.log | grep Acc`
发现ip 192.168.75.129
![](https://pic.desolatehao.top/7499e16ae51f8e4d0553f5b6e781938d.png)

Over!
![](https://pic.desolatehao.top/089783574d73cc344a0c2b4152e79781.png)