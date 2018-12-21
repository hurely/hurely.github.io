---
layout:     post
title:      基于nuxt和iview搭建OM后台管理系统实践(3)-阿里oss上传组件的封装
subtitle:   运用nuxt的自动生成路由和生成静态html文件特性提高开发效率
date:       2018-06-12
author:     KUNG
header-img: http://upload-images.jianshu.io/upload_images/9476967-f032e14c5911d7ab.png
catalog: true
tags:
    - iview
    - vue
    - nuxt
---

![封面图，使用创客贴制作.png](http://upload-images.jianshu.io/upload_images/9476967-f032e14c5911d7ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 目录结构

这是《基于nuxt和iview搭建OM后台管理系统实践》这一个系列文章的目录，大致思路如下：

- [简要介绍OM后台管理系统，以及开发环境](http://23jt.net/kun/?post=7)
- 自行开发的公共组件（富文本、地图、上传）介绍
- 项目上线流程，自动化打包（Jenkins）
- 项目总结

# 前言

上一篇简要介绍了一下这个项目的项目背景，从这一篇开始我会写开发公共组件的过程，这一篇讲解一下富文本编辑器quill的集成吧。

# 少废话，看东西

如动图所示，为后台管理系统添加内容的功能页面，可以看到已经集成了上传图片组件和富文本编辑器组件。
![富文本编辑器和上传组件的结合使用](http://upload-images.jianshu.io/upload_images/9476967-2b41ef767e610beb.gif?imageMogr2/auto-orient/strip)

# 富文本编辑器

这个富文本集成了quill这个开源库 [[quill中文文档]](https://github.com/BingKui/QuillChineseDoc/blob/master/SUMMARY.md)。在vue-cli构建的项目中直接引用quill的包一点问题都没有，但是我用的nuxt.js是基于服务端渲染的，多数情况下会报下面这个错误：

```
window is not defined
```
这是因为window对象只存在于浏览器端，服务端渲染的时候是不存在window对象的。那么我应该怎么做呢？？

![报错信息展示](http://upload-images.jianshu.io/upload_images/9476967-1b9e0c3978533cb0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我还是直接上代码吧：

1. 第一步在plugins下新建quill插件文件**nuxt-quill-plugins.js**
```
// 文件plugins/nuxt-quill-plugins.js
import Vue from 'vue'
// import VueQuillEditor from 'vue-quill-editor'
// Vue.use(VueQuillEditor) 直接引用会报错

if (process.browser) {
//加一个浏览器端判断，只在浏览器端才渲染就不会报错了
  const VueQuillEditor = require('vue-quill-editor/dist/ssr')
  Vue.use(VueQuillEditor)
}

```

2. 第二步以插件形式配置quill

```
//文件nuxt.config.js，省略其他代码
plugins: [
    '~plugins/iview-ui',
    '~plugins/qs',
    '~plugins/urlencode',
    {src: '~plugins/nuxt-quill-plugin.js',ssr: false}
],
```

3. 第三步开始封装组件


```
//文件 components/full-editor.vue
<template>
  <section class="container">
    <!-- <form id="uploadForm"> -->
    <input class="file" type="file" style="display:none" id="file" ref="input" @change="doUpload">
    <!-- </form> -->
    <div class="quill-editor"
        ref="myQuillEditor" 
         :content="content"
         @change="onEditorChange($event)"
         @blur="onEditorBlur($event)"
         @focus="onEditorFocus($event)"
         @ready="onEditorReady($event)"
         v-quill:myQuillEditor="editorOption">
    </div>
  </section>
</template>

<script>
import {qiniuConfig,quillEditorConfig} from '~/config';//七牛上传和富文本toolbar配置文件
const QiniuUPToken = require('qiniu-uptoken');//前端生成七牛上传token
import axios from '~/plugins/axios';

export default {
  name: "full-editor",
  head() {
    return {
      link: [
        {
          href: "/full-editor/quill.core.css",
          rel: "stylesheet"
        },
        {
          href: "/full-editor/quill.snow.css",
          rel: "stylesheet"
        },
        {
          href: "/full-editor/quill.bubble.css",
          rel: "stylesheet"
        }
      ]
    };
  },
  data() {
    const self = this;
    return {
      content: "",
      editorOption: {
        // some quill options
        modules: {
          toolbar: {
            container:quillEditorConfig.toolbarOptions,
            handlers:{
              'image':function(){
                // console.log(this)
                this.quill.format('image', false);//禁用quill内部上传图片方法
                self.imgHandler(this)
              }
            }
          },
        },
        placeholder: '请输入信息',
        theme: "snow",
        quill:''
      }
    };
  },
  mounted() {
    // console.log("app init");
  },
  methods: {
    onEditorBlur(editor) {
      // console.log("editor blur!", editor);
    },
    onEditorFocus(editor) {
      // console.log("editor focus!", editor);
    },
    onEditorReady(editor) {
      // console.log("editor ready!", editor);
    },
    onEditorChange({ editor, html, text }) {
      // console.log("editor change!", editor, html, text);
      this.content = html;
      this.$emit('editorContent',html)
      // console.log(this.content);
    },
    imgHandler(handle){
      this.quill = handle.quill;
      var inputfile = document.getElementById('file');
      inputfile.click();
    },
    doUpload(){
      let files = document.getElementById('file');
      // console.log(files.files[0]);
      let uptoken = QiniuUPToken(qiniuConfig.access_key,qiniuConfig.secret_key,qiniuConfig.bucketname)
      // console.log(uptoken);   
      this.qiniuUpload(files.files[0],uptoken);
    },
    qiniuUpload(file, token){
      let param = new FormData(); //创建form对象
      param.append('file',file,file.name);//通过append向form对象添加数据
      param.append('token',token);//添加form表单中其他数据
      // console.log(param. `get('file')); //FormData私有类对象，访问不到，可以通过get判断值是否传进去
      let config = {
        headers:{'Content-Type':'multipart/form-data'}
      }; //添加请求头
      axios.post(qiniuConfig.action_url,param,config)
      .then(res=>{
        // console.log(res);
        // console.log(this.quill);
        let length = this.quill.getSelection().index;
        const imgUrl = qiniuConfig.pic_hostname+res.key;//插入上传的图片
        this.quill.insertEmbed(length, 'image', imgUrl);
        // this.quill.insertEmbed(index, 'image', imgUrl);//插入上传的图片
        // console.log(res.data);
      })
      .then((err)=>{
        // console.log(err)
      })

    }
  }
};
</script>

<style  scoped>
.container {
  width: 100%;
  margin: 0 auto;
  /* padding: 10px 0; */
}
.quill-editor {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}
</style>
```
封装组件需要注意的几个点：

- 在组件页面（head方法）引用css样式，不要全局引用，head方法的配置具体参考[nuxt官方文档](https://zh.nuxtjs.org/api/pages-head)，这里不做过多赘述


```
<script>
export default {
    head() {
        return {
          link: [
            {
              href: "/full-editor/quill.core.css",
              rel: "stylesheet"
            },
            {
              href: "/full-editor/quill.snow.css",
              rel: "stylesheet"
            },
            {
              href: "/full-editor/quill.bubble.css",
              rel: "stylesheet"
            }
          ]
        };
     },
}
</script>
```

- 为了保持代码的简介，我这里把quill工具栏的配置文件放到了config/index.js文件里了


```
//  文件config/index.js

/**
 * @description 富文本编辑器quill的配置文件
 * @argument 参考文档https://sheweifan.github.io/2018/01/07/nuxt-quill-qiniu/
 * @argument quill中文文档https://github.com/BingKui/QuillChineseDoc/blob/master/SUMMARY.md
 */
export const quillEditorConfig = {
  toolbarOptions:[
    ["bold", "italic", "underline", "strike"], // 切换按钮
    ["blockquote", "code-block"],
    // [{ header: 1 }, { header: 2 }], // 用户自定义按钮值
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // 上标/下标
    [{ indent: "-1" }, { indent: "+1" }], // 减少缩进/缩进
    [{ direction: "rtl" }], // 文本下划线
  
    [{ size: ["small", false, "large", "huge"] }], // 用户自定义下拉
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
  
    [{ color: [] }, { background: [] }], // 主题默认下拉，使用主题提供的值
    [{ font: [] }],
    [{ align: [] }],
    ['image'],//上传图片
    ['video'],//视频
    ["clean"] // 清除格式
  ]
}

```

- 组件原生图片上传是直接把图片处理成base64位的存储，我这里为了存储方便，会把图片上传到七牛上，这里也遇到了一点小坑。首先要禁用quill内部上传图片方法，然后用一个隐藏的input[type=file]实现选择图片，然后模拟七牛表单提交不刷新的操作，最终实现图片上传七牛（还得在前端应用一个库生成token），以上完整代码里有呈现。

![实现的逻辑](http://upload-images.jianshu.io/upload_images/9476967-0c1d7c5c51eddd14.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 编辑时需要传递content到子组件我这里用的ref

```
// 父组件
<template>
  <div class="body">
    <full-editor
        ref="myFullEditor"
        v-model="formItem.body"
        @editorContent="editorContent"
        >
    </full-editor>
  </div>
</template>
<script>
const fullEditor = () => import("@/components/full-editor");
export default {
  layout: "nav",
  components: {
    fullEditor
  },
  mounted() {
    this.loadData();//加载数据
    this.$refs.myFullEditor.content = this.body;//父组件给富文本编辑器传递值
  }
}
</script>
```

# 总结

封装一个富文本组件，开始做之前以为会蛮容易的，以为就引用一下就就可以了，没想到会遇到以上的那些坑，最终在百度和翻阅github后很好的解决了问题，最终也封装完成也满足了需求，后续我会找个时间剔除一些业务代码把组件放到github上。
