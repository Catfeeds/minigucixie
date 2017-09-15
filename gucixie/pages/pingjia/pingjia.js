// pages/pingjia/pingjia.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconn:true,
    star:"star01",
    star01:"star01",
    star02:"star01",
    star03:"star01",
    star04:"star01",
    pingjia:[{},{},{},{},{},{}],
    proData:[],
    pronum:0,
    orderId:0,
    proId:0,
    num:0,
    content:''
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var proId = options.proId;
    var pronum = options.num;
    var orderId = options.orderId;
    that.setData({
      pronum:pronum,
      orderId: orderId,
      proId: proId
    });
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/index',
      method: 'post',
      data: {
        pro_id: proId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        console.log(res);
        if (status == 1) {
          var pro = res.data.pro;
          that.setData({
            proData: pro
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  // icon:function(e) {
  //   this.setData({
  //     iconn:!this.data.iconn
  //   })
  // },
  sendContent:function (e){
    var that = this;
    var content = that.data.content;
    var num = that.data.num;
    var orderId = that.data.orderId;
    var proId = that.data.proId;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Order/sendContent',
      method: 'post',
      data: {
        uid: app.d.userId,
        pro_id: proId,
        order_id: orderId,
        content: content,
        num: num,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status == 1) {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  star_click:function(e) {
    if (e.target.id == 0) {
        this.setData({
          star: "star", 
          star01: "star01",
          star02: "star01",
          star03: "star01",
          star04: "star01",
          num:1
        })
    } else if (e.target.id == 1) {
      this.setData({
        star: "star",
        star01:"star",
        star02: "star01",
        star03: "star01",
        star04: "star01",
        num:2
      })
    } else if (e.target.id == 2) {
      this.setData({
        star: "star",
        star01: "star",
        star02: "star",
        star03: "star01",
        star04: "star01",
        num:3
      })
    } else if (e.target.id == 3) {
      this.setData({
        star: "star",
        star01: "star",
        star02: "star",
        star03: "star",
        star04: "star01",
        num:4
      })
    } else if (e.target.id == 4) {
      this.setData({
        star: "star",
        star01: "star",
        star02: "star",
        star03: "star",
        star04: "star",
        num:5
      })
    }
  },

  bindTextAreaBlur:function (e) {
    var content = e.detail.value;
    this.setData({
      content: content
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      wx.setNavigationBarTitle({
        title: '发表评价',
      })
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