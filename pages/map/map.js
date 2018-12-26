// pages/map/map.js
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapKey: "MKWBZ-IH53W-NGSRB-OTOS7-2SW52-AHBOI",  //地图的key
    markers: [],  //地图参数
    circles: [],  //区域
    keysValue: '', //关键字
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
        id: 1,
        title: '驾车',
        name: 'driving'
      },
      {
        id: 2,
        title: '步行',
        name: 'walking'
      },
      {
        id: 3,
        title: '骑行',
        name: 'bicycling'
      },
      {
        id: 4,
        title: '公交',
        name: 'transit'
      }
    ], 
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
              'padding': '4rpx', 'boxShadow': '0 0 5rpx #333', 'borderRadius': '2rpx'
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
              'display': 'ALWAYS', 'fontSize': '30rpx', 'content': '我的位置',
              'padding': '8rpx', 'boxShadow': '0 0 5rpx #333', 'borderRadius': '4rpx'
            }
          }],
          circles: [{
            latitude: res.latitude,
            longitude: res.longitude,
            fillColor: '#7cb5ec88',
            color: '#7cb5ec88',
            radius: 500,
            strokeWidth: 1
          }],
        })
      }
    })
  },


  //搜索周边
  searchNearby(e) {
    let that = this,
      keysValue = e.detail.value.keysValue;
    that.setData({
      keysValue: keysValue
    });

    // 调用接口
    qqmapsdk.search({
      keyword: that.data.keysValue,
      location: that.data.latitude + ',' + that.data.longitude, //以我的位置作为周边搜索中心点
      success(res) {
        // console.log(res);
        var mks = []
        for (var i = 0; i < res.data.length; i++) {
          mks.push({ // 获取返回结果，放到mks数组中
            title: res.data[i].title,
            id: res.data[i].id,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
            iconPath: "https://xcx.quan5fen.com/Public/xcx-hitui/image/imgs-jyh/map-ico2.png", //图标路径
            width: 30,
            height: 30
          })
        }
        //渲染markers
        that.setData({
          markers: that.data.originMarkers.concat(mks),
          polyline: [] //清空路线
        })

      },
      fail(res) {
        console.log(res);
      },
      complete(res) {
        // console.log(res);
      }
    });

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
          tolatitude: v.latitude,
          tolongitude: v.longitude,
        })
      }
    })
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
  },

  //路线规划 
  linePlanning(e) {
    let that = this,
      mapKey = that.data.mapKey,
      trafficWay = that.data.trafficWay, //出行方式
      fromMap = that.data.latitude + ',' + that.data.longitude, //始点
      toMap = that.data.tolatitude + ',' + that.data.tolongitude; //终点
    //网络请求设置
    var opt = {
      //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
      url: "https://apis.map.qq.com/ws/direction/v1/" + trafficWay + "/?from=" + fromMap + "&to=" + toMap + "&key=" + mapKey + "",
      method: 'GET',
      dataType: 'json',
      //请求成功回调
      success(res) {
        //console.log(res);
        var ret = res.data
        if (ret.status != 0) return; //服务异常处理

        var coors = ret.result.routes[0].polyline, pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
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