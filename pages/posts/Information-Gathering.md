---
title: 信息收集
lang: zh
date: 2025-02-27
type: note
---

> **免责声明**：由于传播、利用此文所提供的信息而造成的任何直接或间接的后果和损失，均由使用者本人自行承担相关法律风险及责任，文章作者、工具提供者不对使用者的未授权行为和后果负责。在进行相关知识学习，技术操作时请务必遵守《中华人民共和国个人信息保护法》、《中华人民共和国网络安全法》等相关法律法规

> **未经desolatehao'Blog同意,禁止转载,转载时需要标明desolatehao'Blog**

### 范围

网络信息：IP 地址范围、域名和子域名、网络拓扑结、路由信息；

系统信息：操作系统类型和版本、主机名和主机信息、已安装的软件和服务；

应用信息：Web 应用程序和 API、应用程序框架和版本、已知漏洞和补丁状态；

用户信息：用户名和用户组、邮箱地址和联系方式、社交工程信息。

企业
天眼查、企查查、企业信用信息公示系统

### 资产测绘

#### fofa

    1. ip="1.1.1.1" 通过单一 IPv4 地址进行查询
    2. ip="220.181.111.1/24" 通过 IPv4 C 段进行查询-
    3. ip="2600:9000:202a:2600:18:4ab7:f600:93a1" 通过单一 Ipv6 地址进行查询
    4. port="6379" 通过端口号进行查询
    5. domain domain="qq.com" 通过根域名进行查询
    6. host host=".fofa.info" 通过主机名进行查询
    7. js_name="js/jquery.js" 通过 HTML 正文包含的 JS 进行查询
    8. body="网络空间测绘" 通过 HTML 正文进行查询
    9. icon_hash="-247388890" 通过网站图标的 hash 值进行查询
    10. icp icp="京 ICP 证 030173 号" 通过 HTML 正文包含的 ICP 备案号进行查询

#### Huntu

    1. ip.tag="CDN" 查询包含 IP 标签"CDN"的资产
    2. web.similar="baidu.com:443" 查询与 baidu.com:443 网站的特征相似的资产
    3. web.similar_icon == "17262739310191283300" 查询网站 icon 与该 icon 相似的资产
    4. web.tag="登录页面" 查询包含资产标签"登录页面"的资产
    5. domain.suffix="qianxin.com" 搜索主域为"qianxin.com"的网站
    6. ip="1.1.1.1" 搜索 IP 为 ”1.1.1.1”的资产
    7. ip="1.1.1.0/24" 搜索网段为"1.1.1.0"的 C 段资产
    8. web.title="北京" 从网站标题中搜索“北京”
    9. web.body="网络空间测绘" 搜索网站正文包含”网络空间测绘“的资产
    10. icp.web_name="奇安信" 搜索 ICP 备案网站名中含有“奇安信”的资产

### 域名收集

#### Subfinder

![](https://pic.desolatehao.top/b972292e84a2d1e54c8b734e4d39b2e6.png)

| -config          | API密钥等的配置文件                         |
| :--------------- | :------------------------------------------ |
| -d               | 查找子域                                    |
| -dL              | 包含要枚举的域列表的文件                    |
| -nC              | 不要在输出中使用颜色                        |
| -nW              | 从输出中删除通配符和失效子域                |
| -o               | 输出结果到指定文件                          |
| -oD              | 输出结果到指定目录                          |
| -oI              | 以Host，IP格式写入输出                      |
| -oJ              | 以JSON格式写入输出                          |
| -r               | 以逗号分隔的要使用的解析程序列表            |
| -rL              | 包含要使用的解析器列表的文本文件            |
| -t               | 用于解析的并发 goroutine 的数量（默认为10） |
| -timeout         | 超时时间（默认为30）                        |
| -silent          | 仅显示输出中的子域                          |
| -sources         | 用逗号分隔的来源列表                        |
| -exclude-sources | 清单中要排除的来源清单                      |
| -max-time        | 等待枚举结果的分钟数（默认为10）            |
| -v               | 显示详细输出                                |

#### Ksubdomain

主动爆破的方式，通过 DNS 请求直接与目标域名 的 DNS 服务器进行交互，从而发现更多隐藏的子域名
介绍是中文的 但是不太好用
ksubdomain.exe -d desolatehao.top -summary
![](https://pic.desolatehao.top/a5e8b543e0a545261aad31ea58c6585b.png)

| 参数          | 描述                                                             |
| ------------- | ---------------------------------------------------------------- |
| -api          | 使用网络接口                                                     |
| -b string     | 宽带的下行速度，可以是 5M, 5K, 5G，默认值是 1M                   |
| -check-origin | 会从返回包检查 DNS 是否为设定的，防止其他包的干扰                |
| -csv          | 输出 Excel 文件                                                  |
| -d string     | 爆破域名                                                         |
| -dl string    | 从文件中读取爆破域名                                             |
| -e int        | 默认网络设备 ID，默认值是 -1，如果有多个网络设备会在命令行中选择 |
| -f string     | 字典路径，-d 下文件为子域名字典，-verify 下文件为需要验证的域名  |
| -filter-wild  | 自动分析并过滤泛解析，最终输出文件，需要与 -o 搭配               |
| -full         | 完整模式，使用网络接口和内置字典                                 |
| -l int        | 爆破域名层级，默认值是 1，默认爆破一级域名                       |
| -list-network | 列出所有网络设备                                                 |
| -o string     | 输出文件路径                                                     |
| -s string     | resolvers 文件路径，默认使用内置 DNS                             |
| -sf string    | 三级域名爆破字典文件（默认内置）                                 |
| -silent       | 使用后屏幕将仅输出域名                                           |
| -skip-wild    | 跳过泛解析的域名                                                 |
| -summary      | 在扫描完毕后整理域名归属 ASN 以及 IP 段                          |
| -test         | 测试本地最大发包数                                               |
| -ttl          | 导出格式中包含 TTL 选项                                          |
| -verify       | 验证模式                                                         |

#### Crt.sh

crt.sh 是一个公开的证书搜索引擎，用户可以通过它查询 CT 日志并获取证书信息。
这个很不错 基于证书

![](https://pic.desolatehao.top/2cdd5faf2bbe1b5a004fdc50e017f633.png)

### 端口扫描

#### Namp

##### 常用

```shell
nmap -Pn -sS -p1-65535 -sV -O -o 2.txt -T4 47.98.100.197
跳过主机存活 SYN扫描 全端口 探测服务版本 启用OS检测 输出为2.txt 速度T4

-iL <文件>        : 从文件读取目标列表
-sn              : Ping扫描（禁用端口扫描）
-Pn              : 跳过主机发现（假设所有主机在线）
-sS/sT/sA/sW/sM  : TCP SYN/Connect()/ACK/Window/Maimon扫描
-p <端口范围>     : 指定扫描端口 如 -p22, -p1-65535
--exclude-ports <端口>: 排除指定端口
-sV              : 探测服务版本
-O               : 启用OS检测
-oN/-oX/-oS/-oG <文件>: 输出为普通/XML/脚本友好/Grepable格式
-T<0-5>          : 时序模板（0慢，5快） T2太慢了 建议T4起步
--min-rate/--max-rate <速率>: 控制发包速率 1000 10
```

##### 用法

```shell
Nmap 7.95 ( https://nmap.org )
用法: nmap [扫描类型] [选项] {目标规范}

=== 目标规范 ===
格式: 主机名/IP地址/网段，例如 scanme.nmap.org, 192.168.0.1/24
-iL <文件>        : 从文件读取目标列表
-iR <数量>        : 随机选择目标数量
--exclude <主机列表> : 排除指定主机/网段
--excludefile <文件>: 从文件读取排除列表

=== 主机发现 ===
-sL              : 列表扫描（仅列出目标）
-sn              : Ping扫描（禁用端口扫描）
-Pn              : 跳过主机发现（假设所有主机在线）
-PS/PA/PU/PY[端口]: TCP SYN/ACK、UDP或SCTP探测
-PE/PP/PM        : ICMP echo/timestamp/netmask探测
-PO[协议列表]     : IP协议Ping
-n/-R            : 禁用/强制DNS解析（默认按需）
--dns-servers <服务器>: 指定DNS服务器
--system-dns     : 使用系统DNS解析
--traceroute     : 追踪路径

=== 扫描技术 ===
-sS/sT/sA/sW/sM  : TCP SYN/Connect()/ACK/Window/Maimon扫描
-sU              : UDP扫描
-sN/sF/sX        : TCP Null/FIN/Xmas扫描
--scanflags <标志>: 自定义TCP标志位
-sI <僵尸主机[:端口]>: 空闲扫描（利用僵尸主机）
-sY/sZ           : SCTP INIT/COOKIE-ECHO扫描
-sO              : IP协议扫描
-b <FTP中继主机>  : FTP反弹扫描

=== 端口规范 ===
格式: 指定端口范围（例: -p22, -p1-65535）
-p <端口范围>     : 指定扫描端口
--exclude-ports <端口>: 排除指定端口
-F               : 快速模式（扫描默认常见端口）
-r               : 顺序扫描（不随机化）
--top-ports <数量>: 扫描最常见的前N个端口
--port-ratio <比例>: 扫描使用率高于比例的端口

=== 服务/版本检测 ===
-sV              : 探测服务版本
--version-intensity <等级>: 探测强度（0-9）
--version-light   : 轻度探测（强度2）
--version-all     : 完全探测（强度9）
--version-trace   : 显示详细探测过程

=== 脚本扫描 ===
-sC              : 运行默认脚本（--script=default）
--script=<脚本>   : 指定Lua脚本（逗号分隔）
--script-args=<参数>: 传递脚本参数（例: user=admin）
--script-args-file=<文件>: 从文件读取参数
--script-trace    : 显示脚本交互数据
--script-updatedb : 更新脚本数据库
--script-help=<脚本>: 显示脚本帮助

=== 操作系统检测 ===
-O               : 启用OS检测
--osscan-limit    : 仅对明确目标检测OS
--osscan-guess    : 激进猜测OS

=== 性能调优 ===
-T<0-5>          : 时序模板（0慢，5快）
--min-hostgroup/max-hostgroup <数量>: 主机组并行规模
--min-parallelism/max-parallelism <数量>: 探测并行度
--max-retries <次数>: 端口探测重试次数上限
--host-timeout <时间>: 单主机超时放弃时间
--scan-delay/--max-scan-delay <时间>: 探测间隔
--min-rate/--max-rate <速率>: 控制发包速率

=== 防火墙绕过 ===
-f; --mtu <值>    : 分片发包（指定MTU）
-D <诱饵IP列表>   : 使用诱饵IP隐藏扫描源
-S <伪造IP>       : 伪造源IP地址
-e <网卡>         : 指定发送接口
-g/--source-port <端口>: 伪造源端口
--proxies <代理地址>: 通过代理扫描
--spoof-mac <MAC> : 伪造MAC地址

=== 输出格式 ===
-oN/-oX/-oS/-oG <文件>: 输出为普通/XML/脚本友好/Grepable格式
-oA <前缀>        : 同时输出三种主要格式
-v/-d            : 增加详细/调试输出（-vv/-dd更详细）
--open           : 仅显示开放端口
--packet-trace   : 显示所有收发报文
--resume <文件>   : 从中断的扫描继续

=== 其他选项 ===
-6               : 启用IPv6扫描
-A               : 综合扫描（OS+版本+脚本+追踪）
--privileged      : 假定用户有root权限
-V               : 显示版本号
-h               : 显示帮助

示例:
  nmap -v -A scanme.nmap.org
  nmap -v -sn 192.168.0.0/16
  nmap -v -iR 10000 -Pn -p 80
完整手册: https://nmap.org/book/man.html
```

#### Masscan

Masscan 是一款高性能的网络端口扫描工具，由 Robert David Graham 开发。它以其 极高的扫描速度和效率著称，被广泛应用于大规模网络扫描和安全评估。Masscan 的设计灵 感来源于 Nmap，但其扫描速度远远超过 Nmap，能够在短时间内扫描数百万个 IP 地址和 端口

##### 用法

```shell
┌──(yuhao㉿kali)-[~]
└─$ masscan -help

用法：
masscan -p80,8000-8100 10.0.0.0/8 --rate=10000
扫描 10.x.x.x 网络中的一些 Web 端口，速率为 10kpps

masscan --nmap
列出与 nmap 兼容的选项

masscan -p80 10.0.0.0/8 --banners -oB <文件名>
将扫描结果以二进制格式保存到 <文件名>

masscan --open --banners --readscan <文件名> -oX <保存文件>
从 <文件名> 中读取二进制扫描结果，并将它们保存为 XML 格式到 <保存文件>

```

#### Fscan

多于内网扫描
主要功能

```
- 主机存活探测：快速识别内网中的活跃主机
- 端口扫描：全面检测目标主机开放端口
- 服务爆破：支持对常见服务进行密码爆破测试
- 漏洞利用：集成MS17-010等高危漏洞检测
- Redis利用：支持批量写入公钥进行权限获取
- 系统信息收集：可读取Windows网卡信息
- Web应用检测：
    - Web指纹识别
    - Web漏洞扫描
- 域环境探测：
    - NetBIOS信息获取
    - 域控制器识别
- 后渗透功能：支持通过计划任务实现反弹shell
```

##### 常用

```shell
fscan.exe -h 192.168.x.x (全功能、ms17010、读取网卡信息)
```

##### 用法

```shell
=== 目标配置 ===
-h       指定目标（支持格式：192.168.1.1/24, 192.168.1.1-255, 192.168.1.1,192.168.1.2）
-eh      排除特定目标
-hf      从文件导入目标

=== 端口配置 ===
-p       指定端口范围（默认常用端口），如：-p 22,80,3306 或 -p 1-65535
-portf   从文件导入端口列表

=== 认证配置 ===
-user    指定用户名
-pwd     指定密码
-userf   用户名字典文件
-pwdf    密码字典文件
-usera   添加额外用户名
-pwda    添加额外密码
-domain  指定域名

=== SSH相关 ===
-sshkey  SSH私钥路径
-c       SSH连接后执行的命令

=== 扫描控制 ===
-m       指定扫描模式（默认为All）
-t       线程数（默认60）
-time    超时时间（默认3秒）
-top     存活检测结果展示数量（默认10）
-np      跳过存活检测
-ping    使用ping代替ICMP
-skip    跳过指纹识别

=== Web扫描配置 ===
-u       指定单个URL扫描
-uf      从文件导入URL列表
-cookie  设置Cookie
-wt      Web请求超时时间（默认5秒）

=== 代理设置 ===
-proxy   HTTP代理（如：http://127.0.0.1:8080）
-socks5  SOCKS5代理（如：127.0.0.1:1080）

=== POC扫描配置 ===
-pocpath POC文件路径
-pocname 指定POC名称
-full    启用完整POC扫描
-dns     启用DNS日志
-num     POC并发数（默认20）

=== Redis利用配置 ===
-rf      Redis文件名
-rs      Redis Shell配置
-noredis 禁用Redis检测

=== 输出控制 ===
-o       输出文件路径（默认关闭）
-f       输出格式（默认txt）
-no      禁用结果保存
-silent  静默模式
-nocolor 禁用彩色输出
-json    JSON格式输出
-log     日志级别设置
-pg      显示扫描进度条

=== 其他配置 ===
-local   本地模式
-nobr    禁用暴力破解
-retry   最大重试次数（默认3次）
-path    远程路径配置
-hash    哈希值
-hashf   哈希文件
-sc      Shellcode配置
-wmi     启用WMI
-lang    语言设置（默认zh）

```

### 指纹识别

    主机指纹：系统版本、服务、开放端口等。
    网络指纹：IP、域名、协议类型。
    应用指纹：CMS 类型、插件、框架等。
    用户指纹：浏览器信息、行为分析等。

##### 主机指纹

通过主动或被动技术识别目标设备上运行的服务类型及版本
nmap、goby、kscan

##### 应用指纹

识别出具体的应用软件、版本及其组件

    确定目标应用程序的技术栈（如 Node.js、PHP、Java 等）
    判断使用的框架（如 Django、SpringBoot、Vue.js）
    检测使用的内容管理系统（如 WordPress、Ruoyi 等）(CMS)
    获取插件、模块或第三方库信息(jquery 库）

observer_ward、ehole、dddd 扫描端口，识别指纹，扫描漏洞

##### dddd

###### 常用

```shell
dddd64.exe -t 47.98.100.197 -o 1.txt
```

###### 用法

```shell
dddd是一款使用简单的批量信息收集,供应链漏洞探测工具。旨在优化红队工作流，减少伤肝、枯燥、乏味的机械性操作。

Usage:
dddd64.exe [flags]

Flags:
===扫描目标===
-t, -target string  被扫描的目标。 192.168.0.1 192.168.0.0/16 192.168.0.1:80 baidu.com:80 file.txt(一行一个) result.txt(fscan/dddd)

===端口扫描===
-p, -port string              端口设置。默认扫描Top1000
-st, -scan-type string        端口扫描方式 | "-st tcp"设置TCP扫描 | "-st syn"设置SYN扫描 (default "tcp")
-tst, -tcp-scan-threads int  TCP扫描线程 | Windows/Mac默认1000线程 Linux默认4000 (default 1000)
-sst, -syn-scan-threads int  SYN扫描线程 (default 10000)
-mp, -masscan-path string    指定masscan程序路径 | SYN扫描依赖 (default "masscan")
-pmc, -ports-max-count int   IP端口数量阈值 | 当一个IP的端口数量超过此值，此IP将会被抛弃 (default 300)
-pst, -port-scan-timeout int TCP端口扫描超时(秒) (default 6)

===主机发现===
-Pn                 禁用主机发现功能(icmp,tcp)
-nip, -no-icmp-ping 当启用主机发现功能时，禁用ICMP主机发现功能
-tp, -tcp-ping      当启用主机发现功能时，启用TCP主机发现功能

===协议识别===
-tc, -nmap-threads int  Nmap协议识别线程 (default 500)
-nto, -nmap-timeout int Nmap协议识别超时时间(秒) (default 5)

===探索子域名===
-sd, -subdomain                    开启子域名枚举，默认关闭
-nsb, -no-subdomain-brute          关闭子域名爆破
-ns, -no-subfinder                 关闭被动子域名枚举
-sbt, -subdomain-brute-threads int 子域名爆破线程数量 (default 150)
-ld, -local-domain                 允许域名解析到局域网
-ac, -allow-cdn                    允许扫描带CDN的资产 | 默认略过
-nhb, -no-host-bind                禁用域名绑定资产探测

===WEB探针配置===
-wt, -web-threads int  Web探针线程,根据网络环境调整 (default 200)
-wto, -web-timeout int Web探针超时时间,根据网络环境调整 (default 10)
-nd, -no-dir           关闭主动Web指纹探测

===HTTP代理配置===
-proxy string                HTTP代理
-pt, -proxy-test             启动前测试HTTP代理 (default true)
-ptu, -proxy-test-url string 测试HTTP代理的url，需要url返回200 (default "https://www.baidu.com")

===网络空间搜索引擎===
-hunter                           从hunter中获取资产,开启此选项后-t参数变更为需要在hunter中搜索的关键词
-hps, -hunter-page-size int       Hunter查询每页资产条数 (default 100)
-hmpc, -hunter-max-page-count int Hunter 最大查询页数 (default 10)
-lpm, -low-perception-mode        Hunter低感知模式 | 从Hunter直接取响应判断指纹，直接进入漏洞扫描阶段
-oip                              从网络空间搜索引擎中以IP:Port的形式拉取资产，而不是Domain(IP):Port
-fofa                             从Fofa中获取资产,开启此选项后-t参数变更为需要在fofa中搜索的关键词
-fmc, -fofa-max-count int         Fofa 查询资产条数 Max:10000 (default 100)
-quake                            从Quake中获取资产,开启此选项后-t参数变更为需要在quake中搜索的关键词
-qmc, -quake-max-count int        Quake 查询资产条数 (default 100)

===输出===
-o, -output string        结果输出文件 (default "result.txt")
-ot, -output-type string  结果输出格式 text,json (default "text")
-ho, -html-output string  html漏洞报告的名称

===漏洞探测===
-npoc                         关闭漏洞探测,只进行信息收集
-poc, -poc-name string        模糊匹配Poc名称
-ni, -no-interactsh           禁用Interactsh服务器，排除反连模版
-gpt, -golang-poc-threads int GoPoc运行线程 (default 50)
-ngp, -no-golang-poc          关闭Golang Poc探测
-dgp, -disable-general-poc    禁用无视指纹的漏洞映射
-et, -exclude-tags string     通过tags排除模版 | 多个tags请用,连接
-s, -severity string          只允许指定严重程度的模板运行 | 多参数用,连接 | 允许的值: info,low,medium,high,critical,unknown

===配置文件===
-acf, -api-config-file string     API配置文件 (default "config/api-config.yaml")
-nt, -nuclei-template string      指定存放Nuclei Poc的文件夹路径 (default "config/pocs")
-wy, -workflow-yaml string        指定存放workflow.yaml (指纹=>漏洞映射) 的路径 (default "config/workflow.yaml")
-fy, -finger-yaml string          指定存放finger.yaml (指纹配置) 的路径 (default "config/finger.yaml")
-dy, -dir-yaml string             主动指纹数据库路径 (default "config/dir.yaml")
-swl, -subdomain-word-list string 子域名字典文件路径 (default "config/subdomains.txt")

===爆破密码配置===
-up, -username-password string       设置爆破凭证，设置后将禁用内置字典 | 凭证格式 'admin : password'
-upf, -username-password-file string 设置爆破凭证文件(一行一个)，设置后将禁用内置字典 | 凭证格式 'admin : password'

===审计日志 | 敏感环境必备===
-a                               开启审计日志，记录程序运行日志，收发包详细信息，避免背黑锅。
-alf, -audit-log-filename string 审计日志文件名称 (default "audit.log")
```

### 目录扫描

#### Dirsearch

    Dirsearch 是一款开源的目录和文件枚举工具，由 Mauro Soria 开发。它主要用于通过 暴力破解方式发现 Web 服务器上的隐藏目录和文件。Dirsearch 以其高效、灵活和易用性， 成为渗透测试和网络安全评估中的重要工具之一

使用参考 https://blog.csdn.net/qq_43936524/article/details/115271837

##### 常用

```bash
采用默认设置扫描目标url
python3 dirsearch.py -u https://target

使用文件拓展名为php,html,js的字典扫描目标url
python3 dirsearch.py -e php,html,js -u https://target

采用指定路径的wordlist且拓展名为php,html,js的字典扫描目标url
python3 dirsearch.py -e php,html,js -u https://target -w /path/to/wordlist

递归扫描
python3 dirsearch.py -e php,html,js -u https://target -r

设置递归层数为3
python3 dirsearch.py -e php,html,js -u https://target -r -R 3

指定线程(不建议线程数调整过大，可能会影响扫描的结果)
python3 dirsearch.py -e bak,zip,tgz,txt -u https://target -t 30

使用前缀后缀
python3 dirsearch.py -e php -u https://target --prefixes .,admin,_,~(前缀)
```

### JS文件扫描

#### JSFinder

    JSFinder 是一款开源的 JavaScript 文件分析工具，由 Threezh1 开发。它主要用于通过 分析目标网站的 JavaScript 文件，提取其中的敏感信息和隐藏资源，如子域名、API 接口、 敏感路径等。JSFinder 以其高效、准确和易用性，成为渗透测试和网络安全评估中的重要工 具之一。

常用命令 python JSFinder.py -u http://www.xxx.com
