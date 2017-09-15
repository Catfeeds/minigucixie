var app = getApp();
// pages/user/shoucang.js
Page({
  data:{
    page:1,
    productData:[],
  },
  onLoad:function(options){

  },
  onShow:function(){
    // 页面显示
    this.loadProductData();
  },
  removeFavorites:function(e){
    var that = this;
    var ccId = e.currentTarget.dataset.favId;
    wx.showModal({
      title: '提示',
      content: '你确认移除吗',
      success: function(res) {
        res.confirm && wx.request({
          url: app.d.ceshiUrl + '/Api/User/collection_qu',
          method:'post',
          data: {
            id: ccId,
          },
          header: {
            'Content-Type':  'application/x-www-form-urlencoded'
          },
          success: function (res) {
            //--init data
            var data = res.data;
            if(data.status == 1){
              that.loadProductData();
            }else{
              wx.showToast({
                title: data.err,
                duration: 2000
              });
            }
          },
          error: function (e) {
            wx.showToast({
              title: '网络异常！',
              duration: 2000
            });
          }
        });
      }
    });
  },
  loadProductData:function(){
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/User/collection',
      method:'post',
      data: {
        id: app.d.userId,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data
        var data = res.data;
        if(data.status==1){
          that.setData({
            productData: data.sc_list,
          });
        }else{
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

  onReachBottom: function () {
    var that = this;
    var page = that.data.page;
    wx.request({
      url: app.d.ceshiUrl + '/Api/User/collection',
      method: 'post',
      data: {
        page: page,
        id: app.d.userId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data
        var list = res.data.sc_list;
        var status = res.data.status;
        if (status == 1) {
          if (list=='') {
            return false;
          }
          that.setData({
            productData: that.data.productData.concat(list),
            page: parseInt(page)+1,
          });
        } else {
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

});