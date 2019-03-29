---
layout:     post
title:      Ant Design Pro搭建后台管理系统总结
subtitle:   用ant design pro v1.0搭建一个后台管理系统
date:       2019-03-29
author:     KUNG
header-img: /img/tag-bg.jpg
catalog: true
tags:
    - react
    - ant design
---

## 简介

ant design pro阿里巴巴是基于react和ant design构建的一套中后台管理控制台的脚手架。 


### ant design pro具有如下几个特性：

- 基于 Ant Design 体系精心设计，能快速搭建中后台管理系统；
- 使用 React/umi/dva/antd 等前端前沿技术开发；
- 针对不同屏幕大小做适配设计；
- 可配置的主题满足多样化的色彩配置方案；
- Mock 数据实用的本地数据调试方案；
- 前端代理，解决本地开发跨域问题；

### 环境搭建

要开发ant design pro，前提是必须安装了node环境。

```
$ git clone --depth=1 https://github.com/ant-design/ant-design-pro.git project-name /下载代码
$ cd project-name //进入文件夹
$ npm install //安装依赖包
$ npm run start //启动服务
```

### 项目目录结构

```
├── mock                     # 本地模拟数据
├── public
│   └── favicon.ico          # Favicon
├── src
│   ├── assets               # 本地静态资源
│   ├── common               # 应用公用配置，如导航信息
│   ├── components           # 业务通用组件
│   ├── e2e                  # 集成测试用例
│   ├── layouts              # 通用布局
│   ├── models               # dva model
│   ├── routes               # 业务页面入口和常用模板
│   ├── services             # 后台接口服务
│   ├── utils                # 工具库
│   ├── g2.js                # 可视化图形配置
│   ├── theme.js             # 主题配置
│   ├── index.ejs            # HTML 入口模板
│   ├── index.js             # 应用入口
│   ├── index.less           # 全局样式
│   └── router.js            # 路由入口
├── tests                    # 测试工具
├── README.md
└── package.json             # 依赖配置
```

日常开发中，访问最多的是`src/common`（有路由和菜单配置）、`src/models`（数据请求）、`src/routes`(业务代码)等。

## 构建页面

1. 新增页面和菜单路由

```
进入src/routes文件夹
```

![image](https://upload-images.jianshu.io/upload_images/4273576-6244dbd581a030f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/700)



## 分析basic-list



## 从路由到组件过程

我们在左侧的导航栏点击 列子 > 用户列表 后，可以进入到上面截图所示的页面。导航栏的内容在 `src/common/menu.js`中



```
/* 导航栏记录
 * src/common/menu.js
 */
const menuData = [
{
    name: '例子',
    icon: 'table',
    path: 'test',
    children: [
      {
        name: '用户列表',
        path: 'index',
      },
    ],
  },
  ...
```
全局的路由关系是这样一个走向：`src/index.js` 中通过 `app.router(require('./router').default)`将 `src/router.js` 绑定到 dva 实例的 `router` 方法上。而在 `src/router.js` 中又引入了 `src/common/router.js` 中的 `getRouterData` 作为数据源。


```
//src/index.js
....
import dva from 'dva';

....
// 1. Initialize
const app = dva({
  history: createHistory(),
});

// 2. Plugins
app.use(createLoading());

// 3. Register global model
app.model(require('./models/global').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');

export default app._store; // eslint-disable-line

```


## 遇到的坑

### git提交每次都会检测本地代码


