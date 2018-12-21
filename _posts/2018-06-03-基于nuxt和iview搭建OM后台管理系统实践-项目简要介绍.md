---
layout:     post
title:      基于nuxt和iview搭建OM后台管理系统实践-项目简要介绍
subtitle:   运用nuxt的自动生成路由和生成静态html文件特性提高开发效率
date:       2018-06-03
author:     KUNG
header-img: http://upload-images.jianshu.io/upload_images/9476967-909b2e9c3f6a6377.png
catalog: true
tags:
    - iview
    - vue
    - nuxt
---

![封面图，使用创客贴制作](http://upload-images.jianshu.io/upload_images/9476967-909b2e9c3f6a6377.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 目录结构

这是《基于nuxt和iview搭建OM后台管理系统实践》这一个系列文章的目录，大致思路如下：

- [简要介绍OM后台管理系统，以及开发环境](http://23jt.net/kun/?post=7)
- 自行开发的公共组件，[富文本quill[已完成]](http://23jt.net/kun/?post=8)、地图、上传组件的封装过程
- 项目上线流程，自动化打包（Jenkins）
- 项目总结，总结开发过程中的坑点，避免以后再掉坑

#  项目背景

清明节后回到武汉，在周例会上，项目经理提出要开发一个咱们app的后台管理系统（OM系统），预估两周时间开发完并上线，并且要实现前后端分离，最终在经过短暂的技术选型和苦逼开发后终于延后几天并上线了。写下这篇文章记录一下开发（踩坑）过程。

#  项目模块分布

因为是公司的项目，后台模块分布的图片只存在于我的有道云笔记，后续会根据这些模块封装一些公共组件出来。

![iview-admin参考](http://upload-images.jianshu.io/upload_images/9476967-3393b50037dfe760?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#  技术实现

- 左侧和顶部导航：使用nuxt的布局属性，在文件夹layouts里新建nav.vue文件，引入leftNav和topNav组件，使用 layout 属性来为页面指定使用nav布局。导航高亮通过在leftNav里更新menuName字段来实现。

```
// 文件 layouts/nav.vue
<template>
  <div>
    <nuxt/>
    <leftNav/>
    <topNav/>
  </div>
</template>

<script>
// import MyFooter from '~/components/Footer.vue'
import leftNav from '~/components/leftNav.vue';
import topNav from '~/components/topNav.vue';

export default {
  components: {
    leftNav,
    topNav
  }
}
</script>

<style>
</style>
```
---
```
// 文件 pages/index.vue
<script>
  export default {
    layout: "nav",//此处引用layout的nav布局文件
  }
</script>
```
---

- 菜单高亮代码实现
```
//文件 components/left-nav.vue
goto(obj) {
    let path = "";
    // this.$store.commit("upMenuName", obj); //更新menuName
    setStore('menuName',obj);
    this.menuName = getStore('menuName');
    this.$store.state.menuList.forEach(element => {
        element.list.forEach(el => {
          if (el.id == obj) {
            path = el.path;
          }
        });
    });
    this.$router.push(path);
    // window.location = path;
}
```
---
- 全局axios配置,并对登录失效做跳转处理

```
//文件 plugins/axios.js
import axios from 'axios';
import Vue from 'vue';
import * as utils from '../lib/utils';
// import {Spin,Notice}  from 'iview';
// import router from ''

let options = {}
// The server-side needs a full url to works
if (process.server) {
  // options.baseURL = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`
  axios.defaults.baseURL = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}/api`
}
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest';
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.withCredentials = true;
axios.defaults.timeout = 5000;


//请求之前
axios.interceptors.request.use((config)=>{
  // console.log(config)
  // Spin.show();
  return config;
});

//登陆失效跳转登录页面
axios.interceptors.response.use(
  response => {
    console.log('-------axiosResponse---------')
    // console.log(response);
    // Spin.hide();
    return response;
  },
  error => {
    console.log('-------axiosError---------');
    console.log(error.response.status);
    if (error.response.status) {
      switch (error.response.status) {
        case 401:
          // if (process.server){
            utils.clearLocalStorage();
            console.log(window.location)
            window.location.href= '/login?url'+window.location.pathname
          // }
      }
    }
    // Spin.hide();
    // Notice.error({
    //   title: '温馨提示：',
    //   desc: '网络请求失败，请稍后再试'
    // });
    // console.log(error.response.status);
    
    return Promise.reject(error.response.data)
  }
);
export default axios;
```
---
- 有数据请求的页面
```
<script>
import axios from "~plugins/axios";
export default {
    methods:{
        loadData(){
            axios.get(urls.api, { params: this.param })
            .then(res => {
            //请求成功回调
                
            })
            .catch(error => {
            //请求失败
                
       });
    }
}
</script>
```


#  主要技术栈

```
vue、nuxt、iview、axios、vuex、v-charts、proxy、nginx
```

#  参考文档

 以下列了一些开发过程中所用到的文档和ui组件
 
- nuxt官方文档 https://zh.nuxtjs.org/guide

- vue官方文档 https://cn.vuejs.org/index.html

- vuex文档 https://vuex.vuejs.org/zh-cn/ 

- ~~element-admin http://lit.ipyro.cn/#/dashboard~~

- 基于vue的前端ui组件库iview https://www.iviewui.com/

- 基于iview的后台管理系统iview-admin https://iview.github.io/iview-admin/#/home

- ~~vue-element-admin http://panjiachen.github.io/vue-element-admin/#/dashboard~~

- 基于echarts的和vue封装的图表组件v-charts https://v-charts.js.org/#/

- 《nuxt 踩坑之 -- Vuex状态树的模块方式使用》https://blog.csdn.net/github_38847071/article/details/78851209
