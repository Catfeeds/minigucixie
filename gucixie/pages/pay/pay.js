var app = getApp();
// pages/order/downline.js
Page({
  data:{
    itemData:{},
    supplierId:0,
    btnDisabled:false,
    hui:false,
    one:0,
    userId: 0,
    buyCount: 0,
    paytype: 'weixin',//0线下1微信
    remark: '',
    cartId: '',
    addrId: 0,//收货地址
    productData: [],
    address: {},
    total: 0,
    vprice: 0,
    vid: 0,
    addemt: 1,
    vou: []
  },
  hui:function(e){
     var i=1;
     if(this.data.one==0){
        this.setData({
           hui: true,
           one:i,
           total:this.data.vprice
        });
     }
     else{
        this.setData({
           hui: false,
           one: 0,
           total: this.data.vprice
        });
     }


  },

  onLoad:function(options){
    this.setData({
      cartId: options.cartId,
      userId: app.d.userId,
    });
    //this.loadProductDetail();
  },

  onShow: function () {
    this.loadProductDetail();
  },

  loadProductDetail: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    });
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Payment/buy_cart',
      method: 'post',
      data: {
        cart_id: that.data.cartId,
        uid: app.d.userId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data.vou)
        var adds = res.data.adds;
        if (adds) {
          var addrId = adds.id;
          that.setData({
            address: adds,
            addrId: addrId
          });
        }
        that.setData({
          addemt: res.data.addemt,
          productData: res.data.pro,
          total: res.data.price,
          vprice: res.data.price,
          vou: res.data.vou,
        });
      },
    });
  },

  remarkInput:function(e){
    this.setData({
      remark: e.detail.value,
    })
  },
  createProductOrderByWX:function(e){
    this.setData({
      paytype: 'weixin',
    });

    this.createProductOrder();
  },
  createProductOrderByXX:function(e){
    this.setData({
      paytype: 'cash',
    });

    this.createProductOrder();
  },

  onReady: function () {
    //页面渲染完成
    wx.hideToast();
  },

  //选择优惠券
  getvou: function (e) {
    var vid = e.currentTarget.dataset.id;
    var price = e.currentTarget.dataset.price;
    var zprice = this.data.vprice;
    var cprice = parseFloat(zprice) - parseFloat(price);
    this.setData({
      total: cprice,
      vid: vid
    })
  }, 

  createProductOrder:function(){
    this.setData({
      btnDisabled:false,
    })
    //创建订单
    var that = this;
    var addrId = that.data.addrId;
    if (!addrId){
      wx.showToast({
        title: '请选择收货地址!',
        duration: 2000,
      });
      return false;
    }
    //创建订单
    wx.request({
      url: app.d.ceshiUrl + '/Api/Payment/payment',
      method: 'post',
      data: {
        uid: app.d.userId,
        cart_id: that.data.cartId,
        type: that.data.paytype,
        aid: addrId,            //地址的id
        remark: that.data.remark,//用户备注
        price: that.data.total,//总价
        vid: that.data.vid,//优惠券ID
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data        
        var data = res.data;
        if (data.status == 1) {
          //创建订单成功
          if (data.arr.pay_type == 'cash') {
            wx.showToast({
              title: "请自行联系商家进行发货!",
              duration: 3000
            });
            return false;
          }
          if (data.arr.pay_type == 'weixin') {
            //微信支付
            that.wxpay(data.arr);
          }
        } else {
          wx.showToast({
            title: "下单失败!",
            duration: 2500
          });
        }
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！err:createProductOrder',
          duration: 2000
        });
      }
    });

  },

  //调起微信支付
  wxpay: function (order) {
    wx.request({
      url: app.d.ceshiUrl + '/Api/Wxpay/wxpay',
      data: {
        order_id: order.order_id,
        order_sn: order.order_sn,
        uid: this.data.userId,
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        if (res.data.status == 1) {
          var order = res.data.arr;
          wx.requestPayment({
            timeStamp: order.timeStamp,
            nonceStr: order.nonceStr,
            package: order.package,
            signType: 'MD5',
            paySign: order.paySign,
            success: function (res) {
              wx.showToast({
                title: "支付成功!",
                duration: 2000,
              });
              setTimeout(function () {
                wx.navigateTo({
                  url: '../dingdan/dingdan?currentTab=1&otype=deliver',
                });
              }, 2500);
            },
            fail: function (res) {
              wx.showToast({
                title: res,
                duration: 3000
              })
            }
          })
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
          title: '网络异常！err:wxpay',
          duration: 2000
        });
      }
    })
  },

  bindBtnPay:function(){

  },


});