// pages/fit/fit.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    autoplay: true, 
    indicatorDots: true,
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    circular: true,
    catId: 0,
    info: {},
    proList: [],
    con:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var catId = options.catId;
    console.log(options);
    that.setData({
      catId: catId
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
    var that = this;
    var catId = that.data.catId;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/getcatpro',
      method: 'post',
      data: {
        uid: app.d.userId,
        cat_id: catId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // console.log(res.data.info)
        var info = res.data.info;
        var proList = res.data.pro;
        var con = res.data.con;
        that.setData({
          info: info,
          imgUrls: info.img,
          proList: proList,
          con: con,
        });
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    });
  },

  //立即购买
  product: function (e) {
    var proId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../product/product?productId=' + proId,
    })
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
     return {
        title: '骨刺鞋',
        desc: '骨刺鞋!',
        path: '/pages/index/index',
        success: function (res) {
           // 分享成功
        },
        fail: function (res) {
           // 分享失败
        }
     }
  }

})