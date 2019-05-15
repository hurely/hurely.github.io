---
layout:     post
title:      基于nuxt和iview搭建OM后台管理系统实践(5)-高德地图地块气象数据展示组件的封装
subtitle:   运用nuxt的自动生成路由和生成静态html文件特性提高开发效率
date:       2018-07-10
author:     KUNG
header-img: https://kung-1252408270.cos.ap-chengdu.myqcloud.com/markdown/20181221111739.png
catalog: true
tags:
    - iview
    - vue
    - nuxt
---

![封面图，基于创客贴在线制作](http://upload-images.jianshu.io/upload_images/9476967-e29b4e15a0336621.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 目录结构

这是《基于nuxt和iview搭建OM后台管理系统实践》这一个系列文章的目录，大致思路如下：

- [简要介绍OM后台管理系统，以及开发环境](http://23jt.net/kun/?post=7)
- 自行封装的公共组件，[富文本quill[已完成]](http://23jt.net/kun/?post=8)、地图、上传组件（[阿里oss](http://23jt.net/kun/?post=15 )、[七牛上传组件](http://23jt.net/kun/?post=16)已经完成）的封装过程
- 项目上线流程，自动化打包（Jenkins）
- 项目总结，总结开发过程中的坑点，避免以后再掉坑

# 前言

上几篇记录了几个功能比较简单的组件，本篇的高德地图封装遇到了蛮多坑，在此记录一下，避免后面再踩坑。

说到地图组件，其实是其他项目组需要地图数据展示，然后我被借调到其他项目组，最终翻阅高德地图众多api后终于完成了。

# 直接看东西

![高德地图组件展示](http://upload-images.jianshu.io/upload_images/9476967-a2eb7f503eb2fda6.gif?imageMogr2/auto-orient/strip)

本地数据原因，没有完整的展示地图组件功能，待去公司再截取动态图

# 核心代码

```
// 文件componets/amap-weather.vue

<template>
    <div>
        <Form :model="searchForm" :label-width="190" inline>
            <FormItem label="地区">
                <Select v-model="searchForm.crop" style="width:300px" @on-change="changeImage">
                    <Option v-for="item in crops" :value="item.title" :key="item.id">{{item.title}}</Option>
                </Select>
            </FormItem>
        </Form>
        <div :id="id" :style="{'width':width,'height':height}"></div>
    </div>
</template>


<script>
    // import VeAmap from 'v-charts/lib/amap';
    import axios from "../plugins/axios";

    export default {
        name: "VAmap",
        data() {
            return {
                weaherData: [],
                weatherVoList: [],
                arr: [],
                polygons: [],
                searchForm: {
                    crop: ''
                },
                crops: [],
                latID: 124.298158,
                lngID: 43.223817
            };
        },
        props: {
            id: {
                default: "container"
            },
            width: {
                default: "100%"
            },
            zoom: {
                default: 15
            },
            height: {
                default: "800px"
            },
            getlandRequestURL: {
                default: ""
            },
            getgeoJsonURL: {
                default: ""
            },
            getWeatherJsonURL: {
                default: ""
            },
            getAreaData: {
                default: ""
            }
        },
        head() {
            return {
                script: [
                    {
                        src: "http://webapi.amap.com/maps?v=1.4.5&key=key自行去高德地图开发者中心申请&&plugin=AMap.ToolBar"
                    }
                ]
            };
        },
        created: function () {
        },
        mounted() {
            var _this = this;
            if (process.browser) {
                _this.initMap();
                _this.getData();
            }
        },
        methods: {
            getData() {
                var _this = this
                axios.get(_this.getAreaData).then(res => {
                    this.crops = res.data.area
                }).catch(error => {
                    console.log(error);
                });
            },
            changeImage(e) {
                var _this = this;
                this.polygons = [];
                axios.get(_this.getAreaData).then(res => {
                    var changeData = res.data.area
                    changeData.forEach(el => {
                        if (el.title == e) {
                            this.latID = el.point.lat;
                            this.lngID = el.point.lng
                            var _this = this;
                            this.initMap()
                        }

                    })
                }).catch(error => {
                    console.log(error);
                });

            },
            initMap() {
                //地图初始化
                var _this = this;
                var googleLayer = new AMap.TileLayer({
                    getTileUrl: "http://mt{1,2,3,0}.google.cn/vt/lyrs=s&hl=zh-CN&gl=cn&x=[x]&y=[y]&z=[z]&s=Galile"
                }); //定义谷歌卫星切片图层
                var roadNetLayer = new AMap.TileLayer.RoadNet(); //定义一个路网图层

                var map = new AMap.Map(this.id, {
                    resizeEnable: true,
                    center: [_this.latID, _this.lngID],
                    zoom: _this.zoom,
                    layers: [googleLayer, roadNetLayer] //设置图层
                });
                var toolBar = new AMap.ToolBar({
                    visible: true
                });
                map.addControl(toolBar);
                // debugger;
                // 初始化
                var bounds = map.getBounds();
                var northeast = bounds.Kb.lng + ',' + bounds.Kb.lat;
                var northwest = bounds.Nb.lng + "," + bounds.Kb.lat;
                var southwest = bounds.Nb.lng + ',' + bounds.Nb.lat;
                var southeast = bounds.Kb.lng + ',' + bounds.Nb.lat;

                var area = northeast + ";" + northwest + ";" + southwest + ";" + southeast + ";" + northeast

                _this.loadLandData(area, map); //加载可视范围内的地块

                map.on("moveend", function (e) {
                    //监听页面变化
                    //获取可视区域的经纬度
                    var getBounds = map.getBounds()

                    var bounds = map.getBounds();
                    var northeast = bounds.Kb.lng + ',' + bounds.Kb.lat;
                    var northwest = bounds.Nb.lng + "," + bounds.Kb.lat;
                    var southwest = bounds.Nb.lng + ',' + bounds.Nb.lat;
                    var southeast = bounds.Kb.lng + ',' + bounds.Nb.lat;

                    var area = northeast + ";" + northwest + ";" + southwest + ";" + southeast + ";" + northeast

                    _this.loadLandData(area, map); //加载可视范围内的地块
                });
            },

            loadLandData(area, map) {
                //根据当前区域经纬度获取地图区域的地块
                let _this = this;
                axios
                // .get(_this.getlandRequestURL+"?area[]="+area)
                    .get(_this.getlandRequestURL + "?area[]=" + area)
                    .then(res => {
                        let list = res.data.data;
                        list.forEach(els => {
                            let obj = [];
                            let points = els.geometry.coordinates[0].points; //重新组装接口来的数据
                            points.forEach(el => {
                                obj.push(el.coordinates);
                            });
                            _this.polygonShow(els.id, map, obj); //遍历经纬度并渲染到地图上
                        });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            },

            polygonShow(id, map, obj) {
                //渲染多边形和网格 判断地块是否是重新加载的

                if (!this.polygons.find(p => p.toString() === id.toString())) {
                    //渲染多边形和网格
                    let polygonOpt = {
                        path: obj, //设置多边形边界路径
                        strokeColor: "#FF33FF", //线颜色
                        strokeOpacity: 0.2, //线透明度
                        strokeWeight: 3, //线宽
                        fillColor: "red", //填充色
                        fillOpacity: 0.4, //填充透明度
                        id: id,
                        points: obj
                    };
                    let polygon = new AMap.Polygon(polygonOpt);
                    polygon.setMap(map);
                    this.polygons.push(id);
                    this.polygonClick(map, polygon);
                }

            },
            polygonClick(map, polygon) {
                //点击地块获得格点数据
                var _this = this;
                polygon.on("click", function (e) {
                    let list = e.target.Ch.points;
                    let areas = "";
                    list.forEach(el => {
                        areas += el + ";";
                    });
                    _this.gridPolygonData(map, _this.removeLastCode(areas)); //加载geoJson
                });
            },
            gridPolygonData(map, areas) {
                //加载网格的数据并添加上点击事件
                var _this = this;
                axios
                    .get(_this.getWeatherJsonURL + "?point[]=" + areas)
                    .then(res => {
                        _this.weaherData = res.data.data;//获取所有天气信息
                        let list = res.data.data;
                   
                        let obj = [];
                        list.forEach(els => {
                            let points = els.gridPolygon.points; //重新组装接口来的数据
                            points.forEach(el => {
                                obj.push(el.coordinates);
                            });

                            _this.gridPolygonShow(els.id, map, obj); //遍历经纬度并渲染到地图上
                        });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            },
            // 地图上加载天气轨迹
            gridPolygonShow(id, map, obj) {
                var polygon = new AMap.Polygon({
                    path: obj, //设置多边形边界路径
                    strokeColor: "#FF33FF", //线颜色
                    strokeOpacity: 0.2, //线透明度
                    strokeWeight: 3, //线宽
                    fillColor: "#ccc", //填充色
                    fillOpacity: 0.2, //填充透明度
                    id: id,
                    points: obj
                });

                polygon.setMap(map);//绘制地图
                map.setZoomAndCenter(this.zoom, obj[0]); //重新设置地图中心点
                this.gridPolygonClick(polygon);

            },
            // 点击地块触发的事件
            gridPolygonClick(polygon) {
                var _this = this;
                polygon.on("click", function (e) {
                    _this.loadWeatherData(e.target.Ch.id); //通过id得到当前的数据

                });                
            },

            loadWeatherData(id) {
                // 点击格点获取天气数据
                // alert(id);

                var _this = this;
                let weatherVoList = [];
                let weaherData2 =[];

                weaherData2.push(_this.weaherData[0]);

               weaherData2.forEach(els => {
                    if (els.id == id) {

                      weatherVoList=els.weatherForecastVoList;

                    }   
                });

                _this.$emit('loadWeather',weatherVoList);//把得到的天气数据暴露给父组件引用
                // _this.dataEmpty = false;
            },


            removeLastCode(str) {
                //去掉字符串最后一位
                if (str == null || str == "" || str.length < 1) {
                    return str;
                }
                return str.substring(0, str.length - 1);
            }
        }
    };
</script>

<style scoped>
    .v-charts-data-empty {
        position: absolute;
        top: 0;
        left: 40%;
        font-size: 16px;
        top: 10%;
    }
</style>


```
使用方法：按照vue标准引用局部组件的方式引入即可，分别传入getlandRequestURL，getgeoJsonURL，getWeatherJsonURL，getAreaData地址。


```
<template>
  <div class="body">
    <amap-weather
      getlandRequestURL="/data/getLand.json"
      getgeoJsonURL="/data/getLand.json"
      getWeatherJsonURL="/data/getweatherforgeo.json"
      getAreaData="/data/area.json"
    ></amap-weather>
  </div>
</template>

<script>
import amapWeather from '../../components/amap-weather';
export default {
  layout:'nav',
  components: {
    amapWeather
  },
  head() {
    return {
      title: "高德地图插件"
    };
  },
}
</script>

<style>

</style>

```


# 总结

- 在封装高德地图组件过程中遇到最大的一个坑：nuxt路由跳转到地图页面报错，最终的解决方案是在left-nav.vue跳转方法里做判断，如果路由路径为map就刷新页面，同时利用:active-name="menuName"属性展开左侧菜单；

![路由跳转报错展示](http://upload-images.jianshu.io/upload_images/9476967-3ca4b492bce80269.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



- 另外一个坑就是服务端渲染带来的问题，最终在mounted生命周期函数中根据process做判断是浏览器端还是服务端并做相应的处理，如代码所示

```
mounted() {
    var _this = this;
    if (process.browser) {
        _this.initMap();
        _this.getData();
    }
}
```

- 展示的气象数据需要用到echart图表展示，这一块时间限制并没有做很好的封装，导致代码太乱，后续有时间会做优化；

![乱得一批的代码](http://upload-images.jianshu.io/upload_images/9476967-0d3263bc497e27d7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 另外对于组件命名也不规范，官方推荐用amap-weather.vue这种，在做这一块的总结的时候可以看到上面的代码改过来了；

![组件命名规范](http://upload-images.jianshu.io/upload_images/9476967-638f2803c5eb27a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 系列文章链接
以下为本系列的文章合集，在此列出便于查阅：
-   [基于nuxt和iview搭建OM后台管理平台实践(1)-项目基本介绍](http://23jt.net/kun/?post=7 "基于nuxt和iview搭建OM运维平台实践(1)-项目基本介绍")
- [基于nuxt和iview搭建OM后台管理系统实践(2)-富文本组件的封装](http://23jt.net/kun/?post=8)
- [基于nuxt和iview搭建OM后台管理系统实践(3)-阿里oss上传组件的封装](http://23jt.net/kun/?post=15 "基于nuxt和iview搭建OM后台管理系统实践(3)-阿里oss上传组件的封装")
- [基于nuxt和iview搭建OM后台管理系统实践(4)-七牛上传组件的封装](http://23jt.net/kun/?post=16 "基于nuxt和iview搭建OM后台管理系统实践(4)-七牛上传组件的封装")
