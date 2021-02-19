// pages/map/map.js
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapKey: "",  //地图的key 换成自己的腾讯地图的key
    scale: 14,
    markers: [],  //地图参数
    circles: [],  //区域
    keysValue:"", //关键字
    latitude: "", //纬度 
    longitude: "",  //经度
    polyline: [],   //路线
    tolatitude: "", //目的地纬度
    tolongitude: "", //目的地经度
    trafficWay: "driving", //出行方式，用于接口切换 driving walking bicycling transit
    //交通方式
    goWayIndex: 0,
    goWayArr: [
      {
        id: 0,
        title: "驾车",
        name: "driving"
      },
      {
        id: 1,
        title: "步行",
        name: "walking"
      },
      {
        id: 2,
        title: "骑行",
        name: "bicycling"
      },
      {
        id: 3,
        title: "公交",
        name: "transit"
      }
    ], 

    addressTitle: '',//poi地址标题
    addressDes: '', //poi地址详细 
    distance: '',  //poi距离: 起点到终点的距离，单位：米，
    duration: '', //poi时间: 表示从起点到终点的结合路况的时间，秒为单位 注：步行方式不计算耗时，该值始终为0 

    addressArr: [], //多个地址的列表
    multiToMap:[] , //存储多个地址终点

    adrIsShow:false, //地址列表是否展示
    pioIsShow:false,  //pio模块是否展示

    isPioAdrPopping: false,//pio地址是否弹出
    pioAdrAnimPlus: {},//pio地址动画

    isLinePoping: false, //出行-路线模块地址是否弹出
    lineAnimPlus: {},//路线动画
    
    searchTipsArr:[], //搜索关键词输入提示列表
    //搜索关键词分类列表
    classifyClassArr: [
      {
        id : 0,
        name : "美食"
      },
      {
        id: 1,
        name: "酒店"
      },
      {
        id: 2,
        name: "银行"
      },
      {
        id: 3,
        name: "超市"
      },
      {
        id: 4,
        name: "公园"
      },
      {
        id: 5,
        name: "地铁"
      }
    ], 
    classifyClassId:0,
    classifyClassName:"美食",

    currentCity:"佛山",      //当前城市

    routesLines:"", // 具体路线
    rouLinesIsShow : false, // 是否显示具体路线模块


    //选择城市[省，市,区]
    citysArr: [0, 0, 0],
    aVal: 0,
    bVal: 0,
    cVal: 0,
    sheng: [],
    shi: [],
    qu: [],
    slectAdr:" ",  //选中的地址
    pickType:false,  //控制城市切换完否

  
  },

  
  //获得地图
  getMyMapLocation(e) {
    let that = this;
    //自行查询经纬度 http://www.gpsspg.com/maps.htm
    wx.getLocation({
      type: 'gcj02',  //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success(res) {
        // 当前自己的经纬度 res.latitude，res.longitude
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          originMarkers: [{
            id: "0",
            latitude: res.latitude,
            longitude: res.longitude,
            iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico.png",
            width: 40,
            height: 40,
            callout: {
              'display': 'ALWAYS', 'fontSize': '24rpx', 'content': '我的位置',
              'padding': '6rpx', 'boxShadow': '0 0 5rpx #333', 'borderRadius': '2rpx'
            }
          }],
          markers: [{
            id: "0",
            latitude: res.latitude,
            longitude: res.longitude,
            iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico.png",
            width: 40,
            height: 40,
            callout: {
              'display': 'ALWAYS', 'fontSize': '24rpx', 'content': '我的位置',
              'padding': '6rpx', 'boxShadow': '0 0 5rpx #333', 'borderRadius': '2rpx'
            }
          }],
          circles: [{
            latitude: res.latitude,
            longitude: res.longitude,
            fillColor: '#7cb5ec88',
            color: 'transparent',
            radius: 1000,
            strokeWidth: 1
          }],
        })
      }
    })
  },

  // 搜索关键字
  serachkeywords(keyword){
    var that = this,
        mapKey = that.data.mapKey,
        keyword = that.data.keysValue,
        currentCity = that.data.currentCity,
        lat = that.data.latitude,
        lng = that.data.longitude;
        var latlng = lat+','+lng;

    // 搜索接口
    var _url = "";
    _url = "https://apis.map.qq.com/ws/place/v1/search?boundary=nearby(" + latlng + ",1000,1)&orderby=_distance&keyword=" + keyword + "&page_size=10&page_index=1&key="+ mapKey +"";
    var opt = {
      url: _url,
      method: 'GET',
      dataType: 'json',
      success(res) {
        //console.log(res)
        var mks = [],//存makers地标显示
            adr = []; //存地址信息
        for (var i = 0; i < res.data.data.length; i++) {
          mks.push({
            id: res.data.data[i].id,
            title: res.data.data[i].title,
            address: res.data.data[i].address,
            latitude: res.data.data[i].location.lat,
            longitude: res.data.data[i].location.lng,
            iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico2.png", //图标路径
            width: 30,
            height: 30
          });
          adr.push({
            id: res.data.data[i].id,
            title: res.data.data[i].title,
            address: res.data.data[i].address,
            latitude: res.data.data[i].location.lat,
            longitude: res.data.data[i].location.lng,
            distance: "",
            duration: ""
          });
        }

        //多个地址终点
        var multiToMap = "";
        adr.map(function (v, i, array) {
          multiToMap += v.latitude + "," + v.longitude + ";";
        });
        that.setData({
          multiToMap: multiToMap.substring(0, multiToMap.length - 1)
        });

        that.setData({
          markers: that.data.originMarkers.concat(mks), //渲染markers
          polyline: [], //清空路线
          addressArr: adr,
          pioIsShow: false,
          adrIsShow: true
        });

        that.getMultiDisDur(); //搜索的地址列表
        that.linePopp(); //出行-路线动画

      },fail(res) {
        console.log(res);
      },
      complete(res) {
        // console.log(res);
      }
    }
    wx.request(opt);

  },


  //选择搜索分类
  chooseClassify(e) {
    let that = this,
      id = e.currentTarget.dataset.id;
    that.setData({
      classifyClassId: id
    })
    const classifyClassArr = that.data.classifyClassArr;
    classifyClassArr.forEach(function (v, i) {
      if (i == id) {
        that.setData({
          classifyClassName: v.name,
          keysValue: v.name,
          searchTipsArr: [], //清空提示
          adrIsShow: true,
          polyline: [],    //清空路线
          tolatitude: "",
          tolongitude: "",
        })
        that.serachkeywords(v.name); //搜索关键字    
        that.getMultiDisDur(); //地址列表信息
      }
    })
  },

  //输入关键字的补完与提示
  bindSearchInput(e) {
    let that = this,
      mapKey = that.data.mapKey,
      keyword = that.data.classifyClassName,
      currentCity ='天河区',
      lat = that.data.latitude,
      lng = that.data.longitude,
      v = e.detail.value;
    
    var latlng = lat + "," + lng;

    keyword = v;

    if (v == "" || v == undefined) {
      that.setData({
        searchTipsArr: [],
        adrIsShow: false,
        addressArr: [],
      })
      return
    }

    // 关键字的补完与提示接口
    var _url = "";
    _url = "https://apis.map.qq.com/ws/place/v1/suggestion/?region=" + currentCity + "&keyword=" + keyword + "&location=" + latlng + "&key=" + mapKey + "";
    var opt = {
      url: _url,
      method: 'GET',
      dataType: 'json',
      success(res) {
        if(res.data.status!=0){
          return
        }
        that.setData({
          searchTipsArr: res.data.data,
        })
      }
    }
    wx.request(opt);

  },

  // 选择提示出的列表的地址
  chooseSerTip(e) {
    let that = this,
      title = e.currentTarget.dataset.title,
      des = e.currentTarget.dataset.des,
      duration = e.currentTarget.dataset.duration,
      distance = e.currentTarget.dataset.distance,
      lat = e.currentTarget.dataset.lat,
      lng = e.currentTarget.dataset.lng;
    //console.log(lat+','+lng);
    that.setData({
      tolatitude: lat,
      tolongitude: lng
    })

    var poiMks2 = [];
    poiMks2 = [{
      id: "11111",
      latitude: lat,
      longitude: lng,
      iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico3.png",
      width: 30,
      height: 30,
      callout: {
        'display': 'ALWAYS', 'fontSize': '24rpx', 'content': title,
        'padding': '6rpx', 'boxShadow': '0 0 5rpx #333', 'borderRadius': '2rpx'
      }
    }],

    //渲染markers
    that.setData({
      markers: that.data.originMarkers.concat(poiMks2),
      pioIsShow: true,
      isPioAdrPopping: true,
      polyline:[],
      addressTitle:title,
      // addressDes:des,
      distance: distance,
      duration: duration
    })

    that.pioAdrPopp(); //pioAdr弹出动画

    that.getAddreeInfo(); //目的地地址信息

  },

  //搜索周边
  searchNearby(e) {
    let that = this,
      v = e.detail.value,
      k = "";
    if(e.type=="submit"){
      k = v.keysValue;
    }
    if (e.type =="confirm"){
      k = v;
    }                                                                                                                                                                                                    
    if (k == undefined || k == "") {
      wx.showToast({
        title: '请输入搜索地点',
        icon: 'none'
      })
      return
    }

    that.setData({
      keysValue: k
    });

    that.serachkeywords(k); //搜索关键字    

  },


  //点击标记点时触发
  bindmarkertap(e) {
    var that = this,
      markerId = e.markerId,
      markersArr = [],
      markersArr = that.data.markers;
      
    markersArr.forEach(function (v, i, array) {
      let id = v.id
      if (id == markerId) {
        that.setData({
          addressTitle: v.title,
          tolatitude: v.latitude,
          tolongitude: v.longitude,
          polyline: [],    //清空路线
          pioIsShow: true,
          isPioAdrPopping: true,
        })
        that.pioAdrPopp(); //pioAdr弹出动画
      }
    })

    that.getAddreeInfo(); //目的地地址信息

    that.linePopp(); //出行-路线动画
  },

  //点击地图pio点时触发 pio:位置标记 如：广州塔 
  bindpoitap(e) {
    var that = this,
      poiMks = [];
    poiMks = [{
      id: "11111",
      latitude: e.detail.latitude,
      longitude: e.detail.longitude,
      iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico3.png",
      width: 30,
      height: 30,
      callout: {
        'display': 'ALWAYS', 'fontSize': '24rpx', 'content': e.detail.name,
        'padding': '6rpx', 'boxShadow': '0 0 5rpx #333', 'borderRadius': '2rpx'
      }
    }],
      // console.log(e.detail)
      that.setData({
        tolatitude: e.detail.latitude,
        tolongitude: e.detail.longitude,
        addressTitle: e.detail.name,
        pioIsShow:true,
        adrIsShow:false,
      })

    //渲染markers
    that.setData({
      markers: that.data.originMarkers.concat(poiMks),
      polyline: []    //清空路线
    })


    that.getAddreeInfo(); //目的地地址信息
    
    //pio动画
    that.pioAdrPopp();
    that.setData({
      isPioAdrPopping: true
    })

    that.linePopp(); //出行-路线动画
  },

  // pio到这里
  bindPioTohear(e){
    var that = this;
    that.linePlanning();
  },

  //目的地地址信息
  getAddreeInfo(e){
    let that = this,
      mapKey = that.data.mapKey,
      lat = that.data.tolatitude,
      lng = that.data.tolongitude;
    var latlng = lat + "," + lng;

    //逆地址解析(坐标位置描述)接口
    var _url = "";
    _url = "https://apis.map.qq.com/ws/geocoder/v1/?location=" + latlng + "&key=" + mapKey + "&get_poi=0&poi_options=address_format=short;radius=5000";
    var opt = {
      url: _url,
      method: 'GET',
      dataType: 'json',
      success(res) {
        //console.log(res);
        that.setData({
          addressDes: res.data.result.address
        })

      },
      fail(res) {
        //console.log(res);
      },
      complete(res) {
        //console.log(res);
      }
    }
    wx.request(opt);

    that.getDistanceDuration(); //两地距离，时间
  },

  //出行方式
  selGoWay(e) {
    var that = this,
      goWayArr = [],
      goWayArr = that.data.goWayArr;
    that.setData({
      goWayIndex: e.detail.value,
    })
    goWayArr.forEach(function (v, i, array) {
      let id = v.id
      if (id == that.data.goWayIndex) {
        that.setData({
          trafficWay: v.name
        })
      }
    })

   that.linePlanning();  //路线

  if (that.data.adrIsShow){
    that.getMultiDisDur(); //多个地址信息
  }
  
  },

  //路线规划 
  linePlanning(e) {
    let that = this,
      mapKey = that.data.mapKey,
      trafficWay = that.data.trafficWay, //出行方式
      fromMap = that.data.latitude + ',' + that.data.longitude, //始点
      toMap = that.data.tolatitude + ',' + that.data.tolongitude; //终点

    if (that.data.tolatitude == "" || that.data.tolongitude == "") {
      wx.showToast({
        icon: "none",
        title: '请选择标记地点',
      })
      return
    }

    // transit公车接口参数不一样
    var _url = "";
    if (trafficWay == "transit") {
      _url = "https://apis.map.qq.com/ws/direction/v1/transit/?&from=" + fromMap + "&to=" + toMap + "&LEAST_TIME&output=json&key=" + mapKey + "";
     
    } else {
      _url = "https://apis.map.qq.com/ws/direction/v1/"+trafficWay+"/?&from=" + fromMap + "&to=" + toMap + "&key=" + mapKey + "";
    }

    //网络请求设置
    var opt = {
      //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
      url: _url,
      method: 'GET',
      dataType: 'json',
      //请求成功回调
      success(res) {
        // console.log(res);    
        var ret = res.data;
        
        //距离过近
        if (ret.status == 326) {
          console.log(ret.message);
          wx.showToast({
            icon:'none',
            title: ret.message,
          })
          that.setData({
            routesLines: ret.message
          })
        }
        if (ret.status != 0) return; //服务异常处理

        var pl = [];  // map的polyline参数坐标数组

        var routesLines = ""; //存具体路线
       
        if (trafficWay == "transit") {
          //
          var coors = [],  //阶段路线点串
              routes = [];
          // routes = ret.result.routes; //路线方案
          routes = ret.result.routes[0]; //路线方案:返回了几个方案，占时先选择方案1
          // console.log(routes);

          var steps = [];
              steps = routes.steps;     //路线过程
          steps.map(function (x, i) {
            var polyline;

            console.log(x)

            if (x.mode == "TRANSIT") {
              var lines = [];
              lines = x.lines[0]
              coors.push(lines.polyline);

              // console.log(lines)
              if (lines.vehicle=="BUS"){
                var bus = "公交上车站:" + lines.geton.title + "-公交下车站:" + lines.getoff.title;
                routesLines += bus +","
            
              } else if (lines.vehicle =="SUBWAY"){
                var subway =  "地铁上车站：" + lines.geton.title + "-地铁下车站：" + lines.getoff.title;
                routesLines += subway + ","
              }
            } else if (x.mode =="WALKING") {
              coors.push(x.polyline);

              if (x.steps!=undefined){
                x.steps.forEach(function (g) {
                  // console.log(g)
                  var walking = g.instruction
                  routesLines += walking + ","
                })
               
              }
            }

          })

          //---具体路线
          routesLines = routesLines.substring(0, routesLines.length - 1)+'。';
          // console.log(routesLines);
          that.setData({
            routesLines: routesLines,
            isShowRoutes: true,
          })
   
          //过滤掉返回undefinded的数据
          var coors2 = coors.filter((k) => k != undefined)

        //重新数组
         var newCoors =  coors2.map(function(v){
            //  console.log(v)
           var arr = [];  //存数组
           // 坐标解压
           var kr = 1000000;
           for (var i = 2; i < v.length; i++) {
             v[i] = Number(v[i - 2]) + Number(v[i]) / kr;
             var values = "";
             values = v[i];
             arr.push(values);
           }
            return arr
          })

          //多个合成一个数组
          var newCoors2 = newCoors.reduce((v1, v2) => v1.concat(v2), [])
     
          //将解压后的坐标放入点串数组pl中
          for (var y = 0; y< newCoors2.length; y += 2) {
            pl.push({ latitude: newCoors2[y], longitude: newCoors2[y + 1] })
          }

          //  console.log(pl);

        }else{
           //阶段路线点串(该点串经过压缩，解压请参考：polyline 坐标解压)
          var coors = ret.result.routes[0].polyline;
          //坐标解压（返回的点串坐标，通过前向差分进行压缩）
          var kr = 1000000;
          for (var i = 2; i < coors.length; i++) {
            coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
          }
          //将解压后的坐标放入点串数组pl中
          for (var i = 0; i < coors.length; i += 2) {
            pl.push({ latitude: coors[i], longitude: coors[i + 1] })
          }
          // console.log(pl);
          // --------------------------------
          var routes = [], //存路线方案
            steps = [];//存具体路线
          routes = ret.result.routes[0]; //路线方案
          steps = routes.steps;
          var newSteps = steps.map(function(m){
            return m.instruction
          })

           //---具体路线
          routesLines = newSteps.join(',').substring(0, newSteps.join(',').length - 1) + '。';
          // console.log(routesLines);
          that.setData({
            routesLines: routesLines,
            isShowRoutes: true,
          })
        }

        //设置polyline属性，将路线显示出来
        that.setData({
          polyline: [{
            points: pl,
            color: '#FF0000DD',
            width: 2,
            arrowLine: true
          }]
        })
     
      }
    };
    wx.request(opt);

    that.getDistanceDuration(); //两地距离，时间
  },

  //pio点两地之间的距离,时间
  getDistanceDuration(e) {
    let that = this,
      mapKey = that.data.mapKey,
      trafficWay = that.data.trafficWay, //出行方式
      fromMap = "", //始点
      toMap = ""; //终点
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })

        fromMap = that.data.latitude + ',' + that.data.longitude, //始点
        toMap = that.data.tolatitude + ',' + that.data.tolongitude; //终点
        if (that.data.tolatitude == ""  || that.data.tolongitude == ""){
            wx.showToast({
              icon:"none",
              title: '请选择标记地点',
            })
            return
        }
        let _url = "";
        //距离接口目前 mode仅支持 驾车和步行
        if (trafficWay == "bicycling" || trafficWay == "transit"){
          console.log("该接口占不支持骑行bicycling与公交transit");
          that.setData({
            duration: "接口不支持：未知时间",
            distance: "接口不支持：未知距离"
          })
          // return
        }else{
          _url = "https://apis.map.qq.com/ws/distance/v1/?mode=" + trafficWay + "&from=" + fromMap + "&to=" + toMap + "&key=" + mapKey + "";
          var opt = {
            url: _url,
            method: 'GET',
            dataType: 'json',
            success(res) {
              var distance, duration;
              var elements = [];
              elements = res.data.result.elements[0]
              distance = elements.distance;  //距离
              duration = elements.duration;  //时间

              that.transformUnit(duration, distance); //转换单位

            }
          };
          wx.request(opt);
        }
        
      }

    })
  },

  //搜索的地址列表 距离,时间
  getMultiDisDur(e) {
    let that = this,
      mapKey = that.data.mapKey,
      trafficWay = that.data.trafficWay, //出行方式
      fromMap = "", //始点
      toMap = ""; //终点
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
        fromMap = that.data.latitude + ',' + that.data.longitude, //始点
        toMap = that.data.tolatitude + ',' + that.data.tolongitude; //终点

        var multiToMap = that.data.multiToMap;  //多个

        let _url = "";
        //距离接口目前 mode仅支持 驾车driving和步行waliking
        if (trafficWay == "bicycling" || trafficWay == "transit") {
          console.log("该接口占不支持骑行bicycling与公交transit");
          var addressArr =[];
          addressArr = that.data.addressArr;
          addressArr.forEach(function(v){
            v.duration = "接口不支持：未知时间"
            v.distance = "接口不支持：未知距离"
          })
          that.setData({
            addressArr: addressArr
          })
          return
        } else {
          _url = "https://apis.map.qq.com/ws/distance/v1/?mode=" + trafficWay + "&from=" + fromMap + "&to=" + multiToMap + "&key=" + mapKey + "";
        }
        var opt = {
          url: _url,
          method: 'GET',
          dataType: 'json',
          success(res) {
           // console.log(res);
            var elements = [];
            elements = res.data.result.elements;
            elements.map(function (v, i, array) {
              //----单位换算------：
              //时间格式
              var theTime = parseInt(v.duration),// 秒
                  middle = 0,
                  hour = 0;
              if (theTime > 60) {
                middle = parseInt(theTime / 60);
                theTime = parseInt(theTime % 60);
                if (middle > 60) {
                  hour = parseInt(middle / 60);
                  middle = parseInt(middle % 60);
                }
              }
              v.duration = "" + parseInt(theTime) + "秒";
              if (middle > 0) {
                v.duration = "" + parseInt(middle) + "分" + v.duration;
              }
              if (hour > 0) {
                v.duration = "" + parseInt(hour) + "小时" + v.duration;
              } 
              //距离格式
              if (v.distance < 1000) {
                v.distance = v.distance + "米"
              } else if (v.distance> 1000) {
                v.distance = (Math.round(v.distance / 100) / 10).toFixed(1) + "公里"
              }

              if (trafficWay == "walking" ){
                v.duration = "接口不支持：未知时间"
              } 

              //匹配对应
              var addr = that.data.addressArr;
              addr[i].duration = v.duration;
              addr[i].distance = v.distance;

              //设置地址列表
              that.setData({
                addressArr:addr
              })


              if (trafficWay == "wallking") {
                that.setData({
                  duration: "注：步行方式不计算耗时，该值始终为0",
                })
              }

            });
          }
        };
        wx.request(opt);
      }
    })
  },


  //选择城市bindChangeCitys
  bindChangeCitys(e) {
    let that = this;
    if (e != undefined) {
      let val = e.detail.value;
      // console.log(val)

      that.setData({
        citysArr: val,
        aVal: val["0"],
        bVal: val["1"],
        cVal: val["2"],
      })

      that.getCitys(); //切换获取地址

    }
  },

  //选择城市完毕后
  bindpickendCitys(e) {
    let that = this;
    if (e.type == "pickend") {
      that.setData({
        pickType: true
      })
    }
  },

  //切换获取地址
  getCitys(e) {
    var that = this,
      mapKey = that.data.mapKey;
    //  获取全部行政区划数据
    var _url = "";
    _url = "https://apis.map.qq.com/ws/district/v1/list?key=" + mapKey + "";
    var opt = {
      url: _url,
      method: 'GET',
      dataType: 'json',
      success(res) {
        var ret = res.data;
        //  console.log(res);
        if (ret.status != 0) {
          return
        }

        var aArr = [], bArr = [], cArr = [], minA, maxA, minB, maxB;
        aArr = ret.result[0]
        bArr = ret.result[1]
        cArr = ret.result[2]

        var ah = [], bh = [], ch = [];
        var aVal = that.data.aVal,
          bVal = that.data.bVal,
          cVal = that.data.cVal;

        // 省份
        aArr.forEach(function (a, i) {
          ah.push(a.fullname)
          return ah
        })


        //市
        minA = aArr[aVal].cidx["0"]
        maxA = aArr[aVal].cidx["1"]

        var arrBB = [];
        const newBarr = bArr.map(function (b, i) {
          if (i >= minA && i <= maxA) {
            arrBB.push(b)
          }
          arrBB.forEach(function (bb) {
            bh.push(bb.fullname)
          })
          bh = Array.from(new Set(bh))
          return bh, arrBB
        })
        // console.log(newBarr)

        // 区
        if (arrBB[bVal].hasOwnProperty('cidx')) {
          //console.log(arrBB[bVal])
          minB = arrBB[bVal].cidx["0"]
          maxB = arrBB[bVal].cidx["1"]
        }

        var arrCC = [];
        const newCarr = cArr.map(function (c, i) {
          if (i >= minB && i <= maxB) {
            arrCC.push(c)
          }
          arrCC.forEach(function (cc) {
            ch.push(cc.fullname)
          })
          ch = Array.from(new Set(ch))

          return ch, arrCC
        })
        // console.log(newCarr)

        if (ch[cVal] == undefined) {
          ch[cVal] = ""
        }
        var slectAdr = ""
        slectAdr = ah[aVal] + bh[bVal] + ch[cVal];

        //赋值
        that.setData({
          sheng: ah,
          shi: bh,
          qu: ch,
          slectAdr: slectAdr
        })

        // console.log(slectAdr)

        that.getAdrNalyze();

      }
    }
    wx.request(opt);
  },

  //地址解析（地址-坐标）
  getAdrNalyze(e) {
    let that = this,
      mapKey = that.data.mapKey;
    //接口
    var _url = "";
    _url = "https://apis.map.qq.com/ws/geocoder/v1/?address=" + that.data.slectAdr + "&key=" + mapKey + "";
    var opt = {
      url: _url,
      method: 'GET',
      dataType: 'json',
      success(res) {
        // console.log(res)
        let ret = res.data;
        if (ret.status != 0) {
          return
        }
        var lat, lng, poiMks = [];
        if (that.data.pickType) {
          lat = ret.result.location.lat
          lng = ret.result.location.lng

          poiMks = [{
            id: "0000",
            latitude: lat,
            longitude: lng,
            iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico3.png",
            width: 30,
            height: 30,
            callout: {
              'display': 'ALWAYS', 'fontSize': '24rpx', 'content': that.data.slectAdr,
              'padding': '6rpx', 'boxShadow': '0 0 5rpx #333', 'borderRadius': '2rpx'
            }
          }]


          that.setData({
            tolatitude: lat,
            tolongitude: lng,
            pioIsShow: true,
            adrIsShow: false,
            markers: that.data.originMarkers.concat(poiMks),
            polyline: []
          })

          that.getAddreeInfo(); //目的地地址信息
          that.linePopp(); //出行-路线动画

          //pio动画
          that.pioAdrPopp();
          that.setData({
            isPioAdrPopping: true
          })


        }
      }
    }
    wx.request(opt);

  },


  //转换单位：距离,时间
  transformUnit(t, d) {
    var that = this,
      theTime = parseInt(t),// 秒
      middle = 0,// 分
      hour = 0,// 小时
      duration = "",
      distance = "";

    if (theTime==0){
      duration = 0
    }

    //时间格式
    if (theTime > 60) {
      middle = parseInt(theTime / 60);
      theTime = parseInt(theTime % 60);
      if (middle > 60) {
        hour = parseInt(middle / 60);
        middle = parseInt(middle % 60);
      }
    }
    var duration = "" + parseInt(theTime) + "秒";
    if (middle > 0) {
      duration = "" + parseInt(middle) + "分" + duration;
    }
    if (hour > 0) {
      duration = "" + parseInt(hour) + "小时" + duration;
    }

    //距离格式
    if (d < 1000) {
      distance = d + "米"
    } else if (d > 1000) {
      var dis ="";
      dis = (Math.round(d / 100) / 10).toFixed(1);
      if (dis >= 1000) {
        that.setData({
          scale: 5
        })
      } else if (dis >= 700) {
        that.setData({
          scale: 6
        })
      } else if (dis >= 500) {
        that.setData({
          scale: 7
        })
      } else if (dis >= 300) {
        that.setData({
          scale: 8
        })
      } else if (dis >= 200) {
        that.setData({
          scale: 9
        })
      } else if (dis >= 100) {
        that.setData({
          scale: 10
        })
      }else if (dis >= 20) {
        that.setData({
          scale: 11
        })
      }else if (dis >= 10) {
        that.setData({
          scale: 12
        })
      }else{
        that.setData({
          scale: 13
        })
      }

      distance = dis + "公里"
    }

    that.setData({
      duration: duration,
      distance: distance
    })

    

    return duration, distance;
  },


  //出行-路线弹出动画
  linePopp() {
    let that = this;
    var lineAnimPlus = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    lineAnimPlus.opacity(1).step(0).scale(1, 1).step(1);
    that.setData({
      lineAnimPlus: lineAnimPlus.export(),
    })
  },

  //pioAdr弹出动画
  pioAdrPopp() {
    let that = this;
    var pioAdrAnimPlus = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    pioAdrAnimPlus.bottom(0).step();
    that.setData({
      pioAdrAnimPlus: pioAdrAnimPlus.export(),
    })
  },
  //pioAdr收回动画
  pioAdrTakeback() {
    let that = this;
    var pioAdrAnimPlus = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    pioAdrAnimPlus.bottom(-250 + 'rpx').step();
    that.setData({
      pioAdrAnimPlus: pioAdrAnimPlus.export(),
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.getMyMapLocation();  //地图

    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: that.data.mapKey
    });

    that.getCitys(); //选择城市bindChangeCitys

    // that.getAdrNalyze();  //地址解析（地址-坐标）
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})