
---
layout:     post
title:      dedecms环境上利巧用织梦猫微信小程序插件，制作api接口提供给客户端调用
subtitle:   用抓包工具给小程序找接口
date:       2018-05-25
author:     KUNG
header-img: /img/post-bg-ios9-web.jpg
catalog: true
tags:
    - dedecms
    - api
    - 微信小程序
---

## 起因

来帝都快一个月了，一直是996，临到app要上线bug也改得差不多了，这两天终于能早点下班了。扛着电脑肥来酒店，闲着无事，点开[爱尚吉他](http；//23jt.net/)的后台想着更新点什么东西，然后...网站后台报了个错！！！看到这个我怎么能忍？？百度了一波，报错的问题没解决，倒是找到一个好插件--[织梦微信小程序助手](https://www.dedemao.com/dedeplug/weapp.html#comment-area)。作为一个不会开发后端api的伪程序猿来说，这简直就是一个字，爽！为了以后可能会基于dedecms开发其他客户端，特此记下记录一下。

![2018032815222476791923.png](http://upload-images.jianshu.io/upload_images/9476967-70aa23c1f8bb0fda.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 操作一波

看到**微信小程序一键生成**这些字眼，我的内心有点小激动，我想这个插件大致原理应该是能把dedecms的数据解析成json，供小程序使用。果不其然，酒店这边手机和电脑连接的wifi不在一个网段上，找到另一个神器--[androidHttpCapture](https://github.com/JZ-Darkal/AndroidHttpCapture)安卓手机抓包工具。

- 下载织梦微信小程序助手：https://www.dedemao.com/dedeplug/weapp.html#comment-area ，解压zip文件，选择符合dedecms的编码格式的xml文件（我的是gbk）上传并安装插件，按照如下步骤：“模块--模块管理--上传新模块--选择文件”，插件就安装好了

![20180328152224884019758.png](http://upload-images.jianshu.io/upload_images/9476967-397f21c0288aa448.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 安装好后发现插件会在dedecms程序的plus文件夹下多一个**weapp.php**文件，反正我是看不懂这一坨坨的php代码的，看到有一个变量$action，估计是根据这个变量来获取不同的数据。在网站模块那里也会多一个微信小程序助手的菜单，点击进去按照指示一路写入配置，最主要的是AppID(小程序ID)、AppSecret(小程序密钥)、原始ID，登录进入微信小程序后台就可以看到。最后点击生成小程序按钮，插件会自动生成一个小程序体验的二维码。忽略界面（bootstrap），用户体验还行，这里给开发小哥点个赞。

![2018032815222499327883.png](http://upload-images.jianshu.io/upload_images/9476967-a56f2249f8f7477a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


![2018032815222501867182.png](http://upload-images.jianshu.io/upload_images/9476967-ac7b2d63ce6aae4b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 体验小程序，尽管界面很丑，但是插件基本上还是把dedecms数据库里的数据都展现出来了，后面应该能用得上。

![20180328152225116577049.png](http://upload-images.jianshu.io/upload_images/9476967-1212afce41c41cfb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 配合前面下载回来的androidHttpCapture来抓个包

```
1.设置wifi代理127.0.0.1 端口8888；
2.设置androidHttpCapture环境为微信；
3.打开界面右下角的悬浮按钮，点开预览，然后去微信小程序进入界面；
4.在预览界面可以看到请求的接口地址，可以拿到接口的地址为host/plus/weapp后面为请求的参数；
```

- 
![20180328152225183199110.jpg](http://upload-images.jianshu.io/upload_images/9476967-f1e2a8c30afffa4e.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![20180328152225194345425.jpg](http://upload-images.jianshu.io/upload_images/9476967-cd22a8efa478b976.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![20180328152225196531226.jpg](http://upload-images.jianshu.io/upload_images/9476967-ffd505cb30d80697.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![20180328152225197818470.jpg](http://upload-images.jianshu.io/upload_images/9476967-6bf897d1e3467b28.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 接口列表（去掉织梦猫的渔民换成自己的域名，以下假定为http://baidu.com）


接口名称 | 请求地址 | 请求方式
---|---|---
首页| http://baidu.com/plus/weapp.php?action=index&page=1 | get
关于 | http://baidu.com/plus/weapp.php?action=website | get


# 其他

- 电脑端也可以抓https接口https://www.jianshu.com/p/5539599c7a25
