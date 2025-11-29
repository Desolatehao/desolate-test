---
title: APP抓包问题总结及常见绕过方法
Date: 2025-02-20
---
>**免责声明**：由于传播、利用此文所提供的信息而造成的任何直接或间接的后果和损失，均由使用者本人自行承担相关法律风险及责任，文章作者、工具提供者不对使用者的未授权行为和后果负责。在进行相关知识学习，技术操作时请务必遵守《中华人民共和国个人信息保护法》、《中华人民共和国网络安全法》等相关法律法规

>本文主要记录本人在正常情况下无法抓包或抓不到包的处理方法   
>有关简单设置WIFI代理与证书问题本文不做考究

注：因部分APP可能存在检测模拟器无法运行并且又无好方法绕过检测，故下文中会给出我个人的两种环境的对应的解决方案，【通解】指两种环境皆可，【真机/模拟器】指定环境可行，仅供参考
## 简单HTTP代理&WiFi代理检测

在进行简单设置WIFI代理后出现无法抓包的情况，说明APP设置了代理检测

以下是基于Grok3生成的对简单全局HTTP代理&WiFi代理检测代码
```java
import android.content.Context;
import android.text.TextUtils;

public class ProxyChecker {

    public static boolean isProxyEnabled(Context context) {
        // 1. 检查WiFi代理设置
        String wifiProxyAddress = android.net.Proxy.getHost(context); 
        // 获取WiFi代理主机地址&获取WiFi代理端口号
        int wifiProxyPort = android.net.Proxy.getPort(context);
        boolean hasWifiProxy = !TextUtils.isEmpty(wifiProxyAddress) && wifiProxyPort != -1;

        // 2. 检查全局HTTP代理设置
        String httpProxyAddress = System.getProperty("http.proxyHost"); 
        // 获取全局HTTP代理主机地址&获取全局HTTP代理端口号（字符串）
        String portStr = System.getProperty("http.proxyPort");          
        int httpProxyPort = (portStr != null) ? Integer.parseInt(portStr) : -1; 
        boolean hasHttpProxy = !TextUtils.isEmpty(httpProxyAddress) && httpProxyPort != -1;

        // 3. 返回结果：WiFi代理或全局HTTP代理任一有效即返回true
        return hasWifiProxy || hasHttpProxy;
    }
}
```
### 解决方法
 【通解】使用Postern代理软件、反编译app、hook   
 【模拟器】使用Proxifier找到模拟器进程全局代理   
参考地址：   
[postern代理转发流量到charles](https://www.cnblogs.com/tjp40922/p/16819984.html)   
[Proxifier转发Burpsuite联动xray抓微信小程序数据包](https://cloud.tencent.com/developer/article/2437217)   


## NO_Proxy

代码中强制OkHttp直接连接目标服务器，绕过设备的代理设置（例如全局HTTP代理或WiFi代理）

```java
public class NetworkTask implements Runnable {
    private final Context context;
    public NetworkTask(Context context) {
        this.context = context;
    }
    @Override
    public void run() {
        // 为当前线程准备消息循环，以便处理UI相关操作（如Toast）
        Looper.prepare();
        // 创建OkHttp客户端，配置为不使用系统代理
        OkHttpClient okHttpClient = new OkHttpClient.Builder()
            .proxy(java.net.Proxy.NO_PROXY) // 绕过系统代理，直接连接目标服务器
            .build();
        // 构建HTTP GET请求，目标为百度首页
        Request request = new Request.Builder()
            .url("http://www.abc.com") // 设置请求的URL
            .build();                    // 生成Request对象，默认方法为GET
        try {
            // 执行同步网络请求，获取响应
            Response response = okHttpClient.newCall(request).execute();

            // 从响应中提取正文内容（字符串形式）
            String responseBody = Objects.requireNonNull(response.body()).string();

            // 在屏幕上显示响应内容，持续时间为短时（约2秒）
            Toast.makeText(context, responseBody, Toast.LENGTH_SHORT).show();
        } catch (IOException e) {
            e.printStackTrace();
        }
        Looper.loop();
    }
}
```
### 解决方法 
 【通解】使用HttpCanary代理软件、hook   
 【模拟器】使用Proxifier找到模拟器进程全局代理   
参考地址：  
[Android 抓包工具HttpCanary](https://blog.csdn.net/HUANGXIN9898/article/details/138564778)   
[Proxifier转发Burpsuite联动xray抓微信小程序数据包](https://cloud.tencent.com/developer/article/2437217)   

## 证书锁定SSL/TLS Pinning

在公共网络中我们使用安全的SSL/TLS通信协议进行通信，并且使用数字证书来提供加密和认证。HTTPS的握手环节仍然面临（MIM中间人）攻击的可能性，因此CA证书签发机构也存在被黑客入侵的可能性，同时移动设备也面临内置证书被篡改的风险

目前使用的bp还是fiddle都是基于中间人攻击，截获服务器返回的证书并伪造证书发送给客户端骗取信任

客户端简单校验证书合法性有以下几种情况：

 1. 服务器证书上的域名是否和服务器的实际域名相匹配
 2. 查看证书是否过期
 3. 校验证书链

而有的将APP代码内置仅接受指定域名的证书，而不接受操作系统或者浏览器内置的CA根证书对应的任何证书，那如何实现呢，该方法有多种实现手段，以下是最常见的两种

| **方式** | **优点**     | **缺点**       | **适用场景**   |
| ------ | ---------- | ------------ | ---------- |
| 证书锁定   | 简单直接，安全性高  | 证书更新需重新发布APP | 小型项目，证书稳定  |
| 公钥锁定   | 灵活，证书续期无影响 | 需提取公钥指纹      | 中大型项目，频繁续期 |
### 解决办法
 【通解】
1. **证书锁定**-需要找到指定的服务端证书（.crt或.pem或.p12格式，多半在raw/assets目录）导入抓包工具、运行时Hook、静态反编译
2. **公钥锁定**-静态反编译、运行时Hook、动态注入Frida
3. **通解**-**JustTustMe**禁用、绕过 SSL 证书检查的基于 Xposed 模块

## 安卓应用层抓包通杀
【通解】   
r0capture - https://github.com/r0ysue/r0capture 以下为原项目介绍

- 仅限安卓平台，测试安卓7、8、9、10、11、12、13、14 可用 ；
- 无视所有证书校验或绑定，不用考虑任何证书的事情；
- 通杀TCP/IP四层模型中的应用层中的全部协议；
- 通杀协议包括：Http,WebSocket,Ftp,Xmpp,Imap,Smtp,Protobuf等等、以及它们的SSL版本；
- 通杀所有应用层框架，包括HttpUrlConnection、Okhttp1/3/4、Retrofit/Volley等等；
- 无视加固，不管是整体壳还是二代壳或VMP，不用考虑加固的事情

