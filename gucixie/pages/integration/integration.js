// pages/integration/integration.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chanpin:[
       {
          'img':'http://img2.imgtn.bdimg.com/it/u=3940041934,2803498370&fm=26&gp=0.jpg' ,
        'jin':"仅限2017-4-9/7/8/9",
        'mingcheng': '公众号可以把自己关联的小程序放在自定义菜单中，用户点击可直达小程序',
        'ji':'1000',
        'xiao':'有限期2017年12月09日'
       },
       {
          'img': 'http://img2.imgtn.bdimg.com/it/u=3940041934,2803498370&fm=26&gp=0.jpg',
         'jin': "仅限2017-4-9/7/8/9",
         'mingcheng': '买一送一二',
         'ji': '1000',
         'xiao': '有限期2017年12月09日'
       },
       {
          'img': 'http://img2.imgtn.bdimg.com/it/u=3940041934,2803498370&fm=26&gp=0.jpg',
         'jin': "仅限2017-4-9/7/8/9",
         'mingcheng': '买一送一二胺二维热无若放大方式订单rewr',
         'ji': '1000',
         'xiao': '有限期2017年12月09日'
       },
       {
          'img': 'http://img2.imgtn.bdimg.com/it/u=3940041934,2803498370&fm=26&gp=0.jpg',
         'jin': "仅限2017-4-9/7/8/9",
         'mingcheng': '买一送一二胺二维热无若放大方式订单rewr',
         'ji': '1000',
         'xiao': '有限期2017年12月09日'
       },
       {
          'img': 'http://img2.imgtn.bdimg.com/it/u=3940041934,2803498370&fm=26&gp=0.jpg',
         'jin': "仅限2017-4-9/7/8/9",
         'mingcheng': '买一送一二胺二维热无若放大方式订单rewr',
         'ji': '1000',
         'xiao': '有限期2017年12月09日'
       },
    ]
  },
  xi:function(){
    wx.navigateTo({
      url: '../record/record',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  xiang:function(){



wx.showToast({
   title: '兑换成功',
   icon: '',
   image: '',
   mask: true,
   success: function(res) {

      wx.navigateTo({
         url: '../pay/pay',
         success: function (res) { },
         fail: function (res) { },
         complete: function (res) { },
      })
   },
   fail: function(res) {},
   complete: function(res) {},




})




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