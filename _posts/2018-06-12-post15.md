---
layout:     post
title:      基于nuxt和iview搭建OM后台管理系统实践(3)-阿里oss上传组件的封装
subtitle:   运用nuxt的自动生成路由和生成静态html文件特性提高开发效率
date:       2018-06-12
author:     KUNG
header-img: https://kung-1252408270.cos.ap-chengdu.myqcloud.com/markdown/20181221111739.png
catalog: true
tags:
    - iview
    - vue
    - nuxt
---

![封面图，基于创客贴在线制作](http://upload-images.jianshu.io/upload_images/9476967-24309af373f95b1d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 目录结构

这是《基于nuxt和iview搭建OM后台管理系统实践》这一个系列文章的目录，大致思路如下：

- [简要介绍OM后台管理系统，以及开发环境](http://23jt.net/kun/?post=7)
- 自行开发的公共组件，[富文本quill[已完成]](http://23jt.net/kun/?post=8)、地图、上传组件的封装过程
- 项目上线流程，自动化打包（Jenkins）
- 项目总结，总结开发过程中的坑点，避免以后再掉坑

# 前言

上一篇记录了[quill富文本的封装过程](http://23jt.net/kun/?post=8)，这一篇开始讲解上传组件（七牛、阿里云oss）的封装。

# 看东西

如动图所示，为上传组件演示，可以看到组件有上传、预览、删除重新上传、文件大小校验等功能。
![上传组件演示](http://upload-images.jianshu.io/upload_images/9476967-625a03158e32335b.gif?imageMogr2/auto-orient/strip)

# 阿里oss上传组件实现过程

实现原理：用input[type='file']标签，并绑定一个change事件实现选择本地电脑文件操作，同时通过其他button触发input的change事件，最终与阿里oss进行交互实现上传图片的功能。

步骤1:引入阿里云osssdk代码，需要注意的是：框架使用的nuxt，引入sdk需要按照nuxt的规范在head方法里引入，[附上head方法使用文档地址](https://zh.nuxtjs.org/api/pages-head)；

```
// 文件 components/upload.vue
<template>
<!--省略业务代码-->
</template>
<script>
export default {
  head: {
    script: [{ src: "http://gosspublic.alicdn.com/aliyun-oss-sdk.min.js" }]//引入sdk
  },
<script>
<style>
/*省略样式代码*/
</style>
```


步骤2:获取上传token，后端提供接口，因token有时效性故每次上传操作时需向后端请求；


```
// 文件 components/upload.vue
<template>
<!--省略业务代码-->
</template>
<script>
import axios from "~/plugins/axios";

export default {
  head: {
    script: [{ src: "http://gosspublic.alicdn.com/aliyun-oss-sdk.min.js" }]//引入sdk
  },
  method:{
      doUpload() {
          const _this = this;
          const urls = [];
          this.loading = true;
          axios.get("/api/m/common/oss/getproperties") 
          .then(res=>{
            //向后端请求获取oss token等信息
              _this.ossKey.AccessKeyId = res.data.data.AccessKeyId;
              _this.ossKey.AccessKeySecret = res.data.data.AccessKeySecret;
              _this.ossKey.BucketName = res.data.data.BucketName;
              _this.ossKey.SecurityToken = res.data.data.SecurityToken;
              
            //与阿里oss交互，上传文件到服务器并返回文件路径
          })
      }
  }
<script>
<style>
/*省略样式代码*/
</style>
```

步骤3:与阿里oss交互，上传文件到服务器并返回文件路径；


```
//
postOss(){
    const _this = this;
    const client = new window.OSS.Wrapper({
        region: _this.region,
        accessKeyId: _this.ossKey.AccessKeyId,
        accessKeySecret: _this.ossKey.AccessKeySecret,
        stsToken: _this.ossKey.SecurityToken,
        bucket: _this.ossKey.BucketName
    });
    _this.percentage = 0;
    const files = document.getElementById(_this.id);
    if(files.files[0].size > _this.limitSize){//对文件大小进行校验超出弹出提示框
        _this.$Notice.warning({
            title: '温馨提示',
            desc:  '文件超出'+_this.limitSize/1024+'kb限制，请压缩一下图片再上传'
        });
        _this.loading = false;
        return false;
    }
    if (files.files) {
        const fileLen = document.getElementById(_this.id).files;
        let resultUpload = "";
        for (let i = 0; i < fileLen.length; i++) {
            const file = fileLen[i];
             // 随机命名
            let random_name ="mapOm/" + random_string(6) + "_" + new Date().getTime() + "." + file.name.split(".").pop();
              // 上传
            client.multipartUpload(random_name, file, {
                progress: function*(percentage, cpt) {
                    // 上传进度
                    _this.percentage = percentage;
                }
            })
            .then(results => {
                // 上传完成
                _this.loading = false;
                 _this.show = true;
                 const url = "http://sinochem-agri-fr.oss-cn-beijing.aliyuncs.com/" + results.name;
                 _this.url = url;
                _this.$emit('uploadedUrl',results.name);//把url传给父组件
            })
            .catch(err => {
                _this.loading = false;
                console.log(err);
            });
        }
    }
}
```

步骤4:引用并使用组件；


```
import uploadImg from '~/components/upload';//引入组件

<upload-img label="土壤温度" id="soilTemperature"
    @uploadedUrl="(url) => this.formItem.trend.soilTemperature = url"
    @remove="() => this.formItem.trend.soilTemperature = ''">
</upload-img>
```

# 阿里oss上传组件完整代码

```
<template>
    <FormItem :label="label">
          <template  v-if="!edit">
            <input :id="id" ref="input" @change="doUpload" class="file" type="file">
            <div class="demo-upload-list" v-if="show">
              <img :id="'img_'+id"  :src="url" width="50px" height="50px">
              <div class="demo-upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handleView"></Icon>
                <Icon type="ios-trash-outline" @click.native="handleRemove"></Icon>
              </div>
            </div>
            <Button v-if="!show" :loading="loading" type="ghost" icon="ios-cloud-upload-outline" @click="upload">{{placeholder}}</Button>
            <Modal :title="label+'预览'" v-model="visible">
              <img :src="url" v-if="visible" style="width:100%;height:auto;">
            </Modal>
          </template>
    
          <!-- 预览 -->
          <template  v-else>
            <div class="demo-upload-list">
              <img :id="'img_'+id"  :src="editUrl" width="50px" height="50px">
              <div class="demo-upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handleView"></Icon>
                <Icon type="ios-trash-outline" @click.native="handleRemove"></Icon>
              </div>
            </div>
            <Modal :title="label+'预览'" v-model="visible">
              <img :src="editUrl" v-if="visible" style="width:100%;height:auto;">
            </Modal>
          </template>
    </FormItem>

</template>

<script>
import axios from "～/plugins/axios";
import { random_string } from "～/lib/utils";

export default {
  head: {
    script: [{ src: "http://gosspublic.alicdn.com/aliyun-oss-sdk.min.js" }]
  },
  props: {
    editUrl: {
      default: ""
    },
    showUploadList: {
      type: Boolean,
      default: true
    },
    action: {
      default: ""
    },
    label: {
      default: "上传组件"
    },
    placeholder: {
      default: "上传图表"
    },
    id: {
      default: "upload"
    },
    limitSize: {
      default: 102400
    }
  },
  name: "upload",
  data() {
    return {
      loading: false,
      visible: false,
      show: false,
      region: "oss-cn-beijing",
      percentage: 0,
      url: "",
      urls: [],
      fileList: [],
      ossKey: {},
      edit: false
    };
  },
  created() {},
  mounted() {},
  methods: {
    doUpload() {
      const _this = this;
      const urls = [];
      this.loading = true;

      axios
        .get("/api/getproperties")
        .then(res => {
          _this.ossKey.AccessKeyId = res.data.data.AccessKeyId;
          _this.ossKey.AccessKeySecret = res.data.data.AccessKeySecret;
          _this.ossKey.BucketName = res.data.data.BucketName;
          // _this.ossKey.Endpoint = res.data.data.Endpoint;
          _this.ossKey.SecurityToken = res.data.data.SecurityToken;

          //上传
          const client = new window.OSS.Wrapper({
            region: _this.region,
            accessKeyId: _this.ossKey.AccessKeyId,
            accessKeySecret: _this.ossKey.AccessKeySecret,
            stsToken: _this.ossKey.SecurityToken,
            bucket: _this.ossKey.BucketName
          });
          _this.percentage = 0;
          const files = document.getElementById(_this.id);
          if (files.files[0].size > _this.limitSize) {
            _this.$Notice.warning({
              title: "温馨提示",
              desc:
                "文件超出" +
                _this.limitSize / 1024 +
                "kb限制，请压缩一下图片再上传"
            });
            _this.loading = false;
            return false;
          }

          if (files.files) {
            const fileLen = document.getElementById(_this.id).files;
            let resultUpload = "";
            for (let i = 0; i < fileLen.length; i++) {
              const file = fileLen[i];
              // 随机命名
              let random_name =
                "mapOm/" +
                random_string(6) +
                "_" +
                new Date().getTime() +
                "." +
                file.name.split(".").pop();
              // 上传
              client
                .multipartUpload(random_name, file, {
                  progress: function*(percentage, cpt) {
                    // 上传进度
                    _this.percentage = percentage;
                  }
                })
                .then(results => {
                  // 上传完成
                  _this.loading = false;
                  _this.show = true;
                  const url =
                    "http://sinochem-agri-fr.oss-cn-beijing.aliyuncs.com/" +
                    results.name;
                  _this.url = url;
                  _this.$emit("uploadedUrl", results.name); //把url传给父组件
                })
                .catch(err => {
                  _this.loading = false;
                  console.log(err);
                });
            }
          }
        })
        .catch(errro => {
          this.$Notice.error({
            title: "温馨提示",
            desc: "网络请求失败，请稍后再试"
          });
          _this.loading = false;
          console.log(errro);
        });
    },
    upload() {
      var av = document.getElementById(this.id);
      av.click();
    },
    handleView() {
    //预览
      this.visible = true;
    },
    handleRemove() {
    //删除图片
      const _this = this;
      if (_this.edit == true) {
        _this.edit = false;
        _this.$emit("remove");
      } else {
        _this.visible = false;
        _this.show = false;
        _this.$emit("remove");
      }
    }
  },
  watch: {
    url(val) {
      if (val) {
        this.urls.push(val);
      }
    },
    editUrl() {
      if (this.editUrl != null && this.editUrl != "") {
        this.edit = true;
      }
    }
  }
};
</script>

<style scoped>
.file {
  display: none;
}
.demo-upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}
.demo-upload-list img {
  width: 100%;
  height: 100%;
}
.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
}
.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}
.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
</style>

```

# 总结

iview官方提供了一个上传组件，但是不符合我们实际需求，我查看了源码并在此基础上进行了二次封装最终实现了需求。现在再回过头去看写的代码发现有点乱，后续抽空会进行代码优化。同时要吐槽下阿里oss文档，都没有一个demo让开发者查看，显得很不友好。

