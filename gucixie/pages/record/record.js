// pages/record/record.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    left:[
    { 
      jifen:'购买乎乎或或或或或或或或或获得100积分',
      riqi:'2017/4/5'
      
      },
    {
      jifen: '购买乎乎或或或或或或或或或获得100积分',
      riqi: '2017/4/5'

    },
    {
      jifen: '购买乎乎或或或或或或或或或获得100积分',
      riqi: '2017/4/5'

    },
    ],
    right: [
      {
        jifen: '购买获得100积分',
        riqi: '2017/4/5'

      },
      {
        jifen: '购买乎乎或或或或或或或或或获得100积分',
        riqi: '2017/4/5'

      },
    ]
  },

  xieyi:function(){
    wx.navigateTo({
      url: '../protocol/protocol',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  // tab切换
  tabFun: function (e) {
    //获取触发事件组件的dataset属性 
    var _datasetId = e.target.dataset.id;
    console.log("----" + _datasetId + "----");
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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