// pages/panic/panic.js
var app = getApp();
Page({
  data:{
    'can':'',
  },
   like:function(e){
    console.log(e.currentTarget.dataset.title)
    wx.navigateTo({
      url: '../index/detail?title='+e.currentTarget.dataset.title,
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var cate_id = options.cate_id;
    var that = this;
    // console.log(cate_id);
    wx.request({
        url: app.d.ceshiUrl + '/Api/Voucher/index',
        data: {
            cate_id: cate_id,
        },
        header: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
            console.log(res.data);
            that.setData({
                can: res.data.vou,
            });
        }
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  jj: function (e) {
      var id = e.currentTarget.dataset.id;
      console.log(e);
      wx.request({
          url: app.d.ceshiUrl + '/Api/Voucher/get_voucher',
          data: {
              uid: app.d.userId,
              vid: id,
          },
          header: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
              var status = res.data.status;
              if (status == 1) {
                  wx.showToast({
                      title: '已领取',
                      icon: '',
                      image: '',
                      duration: 0,
                      mask: true,
                      success: function (res) { },
                      fail: function (res) { },
                      complete: function (res) { },
                  })
              } else {
                  wx.showToast({
                      title: res.data.err,
                      duration: 2000,
                  });
              }

          }
      })



  },
})