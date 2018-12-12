---
layout:     post
title:      用vue开发微信小程序-开源框架mpvue体验
subtitle:   使用mpvue开发微信小程序能使开发者得到vue.js的开发体验
date:       2018-12-12
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - vue
    - mpvue
    - 微信小程序
---

## 背景

美团点评在18年3月开源了基于vue.js开发微信小程序的前端框架-mpvue。mpvue 修改了 Vue.js 的 runtime 和 compiler 实现，使其可以运行在小程序环境中，从而为小程序开发引入了整套 Vue.js 开发体验。使用mpvue开发微信小程序能使开发者得到vue.js的开发体验，同时一份代码可以复用到H5。

## mpvue主要特性

- 彻底的组件化开发能力：提高代码复用性；
- 完整的 Vue.js 开发体验；
- 方便的 Vuex 数据管理方案：方便构建复杂应用；
- 快捷的 webpack 构建机制：自定义构建策略、开发阶段 hotReload；
- 支持使用 npm 外部依赖；
- 使用 Vue.js 命令行工具 vue-cli 快速初始化项目；
- H5 代码转换编译成小程序目标代码的能力；

## 最佳实践

下面我会以一个信息展示类型的微信小程序的首页和文章详情页为例子讲解一下模块的具体实现过程。
先扫下二维码看一下效果：

![效果展示图-基于开源软件screenShot制作](https://kung-1252408270.cos.ap-chengdu.myqcloud.com/markdown/20181210165617.png)

![小程序二维码](https://kung-1252408270.cos.ap-chengdu.myqcloud.com/markdown/20181210165446.png)


## 官方五分钟教程

通过 Vue.js 命令行工具 `vue-cli`，你只需在终端窗口输入几条简单命令，即可快速创建和启动一个带热重载、保存时静态检查、内置代码构建功能的小程序项目：

```
# 全局安装 vue-cli
$ npm install --global vue-cli

# 创建一个基于 mpvue-quickstart 模板的新项目
$ vue init mpvue/mpvue-quickstart my-project

# 安装依赖
$ cd my-project
$ npm install
# 启动构建
$ npm run dev
```
接下来，你只需要启动[微信开发者工具](https://mp.weixin.qq.com/debug/wxadoc/dev/quickstart/basic/getting-started.html#%E5%AE%89%E8%A3%85%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7)，打开项目的dist文件夹即可预览到你的第一个 mpvue 小程序。

## 目录结构

![mpvue基本目录结构](https://kung-1252408270.cos.ap-chengdu.myqcloud.com/markdown/20181210171130.png)

我们在开发过程中大部分只需要关注src文件内容即可：

```
├── App.vue
├── components //封装的公共组件
│   ├── back-item.vue //返回首页
│   ├── data-null.vue //数据为空
│   ├── homenews-item.vue //数据展示
│   ├── mpvue-wxpares.vue //富文本渲染
│   ├── newslist-item.vue
│   ├── title-item.vue //标题
├── config //配置文件
│   ├── bmob.js //云数据库配置文件
├── main.js //小程序的配置文件
├── pages //业务代码
│   ├── home
│   │   └── index.vue
│   ├── news
│   │   ├── detail.vue
│   │   ├── list.vue
│   │   └── taglist.vue
├── router //路由配置
│   └── routes.js
├── styles
│   └── index.less
└── utils //封装的工具方法
    ├── api.js
    ├── bmob.js
    ├── net.js
    ├── utils.js
    └── wx.js

```


## 参考文档

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/index.html)
- [用Vue.js开发微信小程序：开源框架mpvue解析](https://tech.meituan.com/mt_mpvue_development_framework.html)
- [mpvue集中式页面配置（路由）](https://github.com/F-loat/mpvue-entry)
- [bmob云数据库-restful文档](http://doc.bmob.cn/data/restful/index.html)