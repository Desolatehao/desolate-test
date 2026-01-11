---
title: XXE-lab
lang: zh
date: 2025-04-18
type: note
---

靶场地址 https://download.vulnhub.com/xxe/XXE.zip

VM启动之后就是一个shell登陆界面，这里靶场没给账号密码，也不知道地址，这里用同NAT的虚拟机寻找一下IP地址存活

![](https://pic.desolatehao.top/a568b8beced881795b3d93c37c67d489.png)
这里 .140是本机 .148就是我们要的XXE主机 同时发现了80端口 访问一下
![](https://pic.desolatehao.top/2625b61f7648e1c2d0e917c1a1279998.png)
发现一个 Apache2 初始界面 扫一下目录发现一个 /robots.txt
![](https://pic.desolatehao.top/b8fd9b66e9515d35a8b7ea9cfc390706.png)
找到目录
/xxe
![](https://pic.desolatehao.top/82b77415a1302760b5f61fad29bb6e95.png)
/xxe/admin.php
![](https://pic.desolatehao.top/c46038092f6fe0a2843edc85b83f0be1.png)

在/xxe中登陆测试发现 数据是通过XML来传输的
![](https://pic.desolatehao.top/b7ac7645bbaf71d77dfe38cfca2f7922.png)

直接上文件读取，发现可以读取

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE root [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>
    <name>&xxe;</name>
    <password>admin</password>
</root>
```

![](https://pic.desolatehao.top/76c5404b8b655799f24e79e3e5792166.png)
apache首页文件默认路径时`/var/www/html/`
读取一下默认目录`file:///var/www/html/xxe/index.php`
![](https://pic.desolatehao.top/7db5e6e555b4f1a3800d223742feb84c.png)
这里失败了，用以下伪协议来访问 参考 [PHP伪协议](https://pankas.top/2022/03/01/php%E4%BC%AA%E5%8D%8F%E8%AE%AE%E7%AE%80%E5%8D%95%E6%80%BB%E7%BB%93/)
`php://filter/read=convert.base64-encode/resource=admin.php`

![](https://pic.desolatehao.top/31e81fe3ea341048675a4785a7f1ba7d.png)
base64解码一下发现，密码用md5解密为admin@123
![](https://pic.desolatehao.top/07a3c9a69c947b046f71a46f57879f5c.png)
看看/flagmeout.php内容
![](https://pic.desolatehao.top/7c4c0b2defe7c450bf5b2d82870811e9.png)
`JQZFMMCZPE4HKWTNPBUFU6JVO5QUQQJ5` 先用base32再用base64 解密为 `/etc/.flag.php` 读取一下内容
![](https://pic.desolatehao.top/5301fafef962b13fff0e1fc08e831d6d.png)
看不懂，放到本地运行一下，注意需要PHP7.3失败了 5.4可以出现flag
![](https://pic.desolatehao.top/95e6000da4df45cd9844a7cfca5f0d8b.png)
Over!
