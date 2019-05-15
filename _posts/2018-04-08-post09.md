---
layout:     post
title:      基于weex的app开发脚手架weexplus学习笔记
subtitle:   用vue开发app
date:       2018-04-08
author:     KUNG
header-img: http://upload-images.jianshu.io/upload_images/9476967-8bcb54240c61842f.png
catalog: true
tags:
    - weex
    - vue
---

## 认识weexplus

weexplus是基于weex官方的二次开发版本，weex和react native一样同属第2代跨平台技术，解决了第一代性能低下，体验不好的问题，同时保留了第一代 多平台一套代码，基于web技术栈，支持动态发版 等所有优点。--weexplus脚手架作者

## 开发

- **运行开发环境**(默认已经安装好node环境)
```
$ npm install  weex-toolkit -g
$ npm install weexplus -g
$ git clone XXX //下载项目到本地
$ cd XXX // 进入项目根目录
$ npm install
$ npm run dev
$ npm run weexplus
```
- **怎么请求数据**？前端已经封装好net模块，使用方法https://weexplus.github.io/doc/mo-kuai/netwang-luo-fang-95ee29.html

![20180222151927000473585.png](http://upload-images.jianshu.io/upload_images/9476967-c6842b1590ca48d1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- **页面怎么传参数**？运用navigator导航控制器模块实现传参（具体参考文档https://weexplus.github.io/doc/mo-kuai/notify.html）

![20180222151927123753943.png](http://upload-images.jianshu.io/upload_images/9476967-86105c7f93bb5714.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- **怎么获取参数**？
通过weex**globalEvent**模块的**addEventListener**监听**onPageInit模块**的事件（具体参考文档http://weex.apache.org/cn/references/modules/globalevent.html）

![20180222151927117348221.png](http://upload-images.jianshu.io/upload_images/9476967-2cabc5583500aa45.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 那些坑

- 报文件未找到错误(如下图)，解决方案：按照报错指定路径新建文件config.json

![20180222151926927719367.png](http://upload-images.jianshu.io/upload_images/9476967-e29520a184e71963.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 网速慢，安装淘宝镜像

```
$ npm install -g cnpm --registry=https://registry.npm.taobao.org

```
## 返回的bug（保存数据多层返回）

```
//在列表页注册页面
var notify=weex.requireModule('notify');
notify.regist('twoPlusListTab',(p)=>{
    this.status=p.index;
})
navigator.setPageId('twoPlusList');//唯一，最好根据当前页面的文件名来命名

//最后的操作页面返回到首页
var notify=weex.requireModule('notify');
notify.send('twoPlusListTab', {index:0});//传参
nav.backTo('twoPlusList');//返回到列表 
```

```
//需要返回刷新
//在列表页注册页面
var notify=weex.requireModule('notify');
notify.regist('twoPlusListTab',(p)=>{
    this.status=p.index;
})
//需要在全局事件监听里设置setPageId
globalEvent.addEventListener("onPageInit", () => {
    navigator.setPageId('twoPlusList');//唯一
})

//在需要刷新的页面
var that = this;
var notify=weex.requireModule('notify');
notify.regist('threeUnlinkList',(p)=>{
    that.refresh();//页面需要有刷新方法
})

//最后的操作页面返回到列表页 twoPlusList，需要写到数据请求的回调函数里
net.post("sinochem/tripartiteContract/add", query, res => {
    modal.toast({ message: "保存成功！" });
    var notify=weex.requireModule('notify');
    notify.send('twoPlusListTab', {index:0});//传参到列表页
    notify.send('threeUnlinkList', {})//跟需要刷新的页面通信
    navigator.backTo('twoPlusList');//返回到列表页
});
```
- 

## 常用代码块


- alert弹窗（weex debug有点坑安卓的基本不能用，有时候需要用这个来做人工断点）

```
var modal = weex.requireModule('modal');

modal.alert({
    message: 'This is a alert',
    duration: 0.3
}, function (value) {
    console.log('alert callback', value)
})
```
```
//不需要回调函数简写
modal.alert({message:'This is a alert');
```
-  confirm确认框弹窗

```
//确认框
modal.confirm({
    message: 'Do you confirm ?',
    duration: 0.3
}, function (value) {
    console.log('confirm callback', value)
})
```
```
//  有回调函数的确认框
modal.confirm(
    {
        message:"this is message",
        okTitle: "确认",
        cancelTitle: "取消"
    },
    function(obj) {
        if (obj == "确认") {
            modal.alert({message:'确认'});
        } else {
            modal.alert({message:'取消'});
        }
    }
);
```

## 正则匹配


```
//只能输数字 不能输负数（金额、面积）
if(!(/^[-]?[0-9]*\.?[0-9]+(eE?[0-9]+)?$/).test(this.area)||this.area<=0){ 
    modal.toast({message:'请输入正确的合同面积'})
    return false;
}
```

```
// 校验身份证号
if(!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/).test(p.identityCode)){
    modal.toast({ message: "请输入正确的身份证号" });
    return;
}
```


## 文档

- weexplus https://weexplus.github.io/doc/
- weex官方文档 http://weex.apache.org/cn/guide/
- weex踩坑攻略 https://juejin.im/entry/59577001f265da6c2211848b
- vue官方文档 https://cn.vuejs.org/
- weex使用过程中的那些坑 http://tech.dianwoda.com/2017/12/25/weexshi-yong-guo-cheng-zhong-de-na-xie-keng/

## 其他

- 推荐用vscode作为编辑器：[下载地址](https://code.visualstudio.com/Download)
