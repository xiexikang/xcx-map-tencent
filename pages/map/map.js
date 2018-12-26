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
    latitude: "", //纬度 
    longitude: "",  //经度
    polyline: [],   //路线
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