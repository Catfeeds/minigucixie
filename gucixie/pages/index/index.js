//index.js
//获取应用实例
var app = getApp()
Page({
  data: {

     // 轮播组件
     "carousel1": {
        height: '400rpx',
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        circular: true,
        width: 'width:25%', comm: '100rpx',
        ggtop:[],
        imgUrls: [],
        b: [],
        // 品牌街
        brand: '限时抢购',
        stor: '33rpx',
        shop: [],
     },
     showModalStatus: false,  //先设置隐藏
     page: 2,
     logo: '../../images/a_a.png',
     info: {},
     proData: [],
     prolength:3,
     proList: [],
     ggtop: []
  },
  
  //搜索跳转事件
  sou:function(){
      wx.navigateTo({
         url: '../search/search',
         success: function(res) {},
         fail: function(res) {},
         complete: function(res) {},
      })
  },

  //购物车
  gou:function(){
     wx.navigateTo({
        url: '../cart/cart',
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
     })
  },
  
  //个人中心
ge:function(){
   wx.navigateTo({
      url: '../user/user',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
   })
},
list: function (e) {
   let id = e.currentTarget.dataset.id;
   console.log(id)
   if (id == 0) {
      wx.navigateTo({
         url: '../slide/mei',
         success: function (res) { },
         fail: function (res) { },
         complete: function (res) { },
      })
   }
   if (id == 1) {
      wx.navigateTo({
         url: '../slide/mei',
         success: function (res) { },
         fail: function (res) { },
         complete: function (res) { },
      })
   }

   if (id == 2) {
      wx.navigateTo({
         url: '../integration/integration',
         success: function (res) { },
         fail: function (res) { },
         complete: function (res) { },
      })
   }
   if (id == 3) {
      wx.navigateTo({
         url: '../synopsis/synopsis',
         success: function (res) { },
         fail: function (res) { },
         complete: function (res) { },
      })
   }



},



//分类
fen: function () {
   wx.navigateTo({
      url: '../category/category',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
   })
},

  //选择其他鞋
  xie:function(e){
    var catId = e.currentTarget.dataset.catid;
     wx.navigateTo({
       url: '../fit/fit?catId=' + catId,
     });
  },

  //立即购买
  product:function(e){
    var proId = e.currentTarget.dataset.id;
     wx.navigateTo({
       url: '../product/product?productId=' + proId,
     })
  },

  bindimg:function(e) {
    var tztype = e.currentTarget.dataset.type;
    var val = e.currentTarget.dataset.val;
    var proid = e.currentTarget.dataset.proid;
    var cid = e.currentTarget.dataset.cid;
    console.log(11)
    if (!tztype) {
      return false;
    } 
    if(tztype=='pro') {
      //商品详情跳转
      if (val){
        wx.navigateTo({
          url: '../product/product?productId=' + parseInt(val),
        });
      }else{
        wx.navigateTo({
          url: '../product/product?productId=' + parseInt(proid),
        });
      }
    } else if (tztype=='procat'){
      if (val) {
        wx.navigateTo({
          url: '../fit/fit?catId=' + parseInt(val),
        });
      } else {
        wx.navigateTo({
          url: '../fit/fit?catId=' + parseInt(cid),
        });
      }
    } else if (tztype=='index') {
      this.onShow();
    } else {
      return false;
    }
  },

  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    console.log(that.data.carousel1.imgUrls);
  },

  onShow: function() {
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    });
    // 生命周期函数--监听页面显示
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Index/index',
      method: 'post',
      data: {
        uid: app.d.userId
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data.ggtop)
        var logo = res.data.logo;
        var info = res.data.info;
        var proData = res.data.pro;//后台热推
        var proList = res.data.prolist;//后台首推
        var len = proData.length;
        var ggtop = res.data.ggtop;
        that.setData({
          logo: logo,
          info: info,
          proData: proData,
          proList: proList,
          prolength: parseInt(len)-1,
          'carousel1.imgUrls': ggtop,
          'carousel1.b':res.data.first,
          'carousel1.shop':res.data.qiang
        });
        console.log(that.data.carousel1.imgUrls);
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    });
  },

   powerDrawer: function (e) {
     var currentStatu = e.currentTarget.dataset.statu;
     this.util(currentStatu)
  },

   //功能页面跳转
   other: function (e) {
     var ptype = e.currentTarget.dataset.ptype;
     var text = e.currentTarget.dataset.text;
     if (ptype == "jifen") {
       wx.navigateTo({
         url: '../ritual/ritual?title=' + text,
       })
     } else if (ptype == "newpro") {
       wx.navigateTo({
         url: '../listdetail/listdetail?ptype=new&title=' + text,
       })
     } else if (ptype == "allpro") {
       wx.navigateTo({
         url: '../category/index?title=' + text,
       })
     }else if (ptype == "brand") {
       wx.navigateTo({
         url: '../synopsis/synopsis?title=' + text,
       })
     }
   },
  util: function (currentStatu) {
     /* 动画部分 */
     // 第1步：创建动画实例 
     var animation = wx.createAnimation({
        duration: 200, //动画时长 
        timingFunction: "linear", //线性 
        delay: 0 //0则不延迟 
     });

     // 第2步：这个动画实例赋给当前的动画实例 
     this.animation = animation;

     // 第3步：执行第一组动画 
     animation.opacity(0).rotateX(-100).step();

     // 第4步：导出动画对象赋给数据对象储存 
     this.setData({
        animationData: animation.export()
     })

     // 第5步：设置定时器到指定时候后，执行第二组动画 
     setTimeout(function () {
        // 执行第二组动画 
        animation.opacity(1).rotateX(0).step();
        // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
        this.setData({
           animationData: animation
        })

        //关闭 
        if (currentStatu == "close") {
           this.setData(
              {
                 showModalStatus: false
              }
           );
        }
     }.bind(this), 200)

     // 显示 
     if (currentStatu == "open") {
        this.setData(
           {
              showModalStatus: true
           }
        );
     }
  },

  //首页触底事件
  onReachBottom: function () {
    var that = this;
    var page = that.data.page
    wx.request({
      url: app.d.ceshiUrl + '/Api/Index/getlist',
      method: 'post',
      data: {
        uid: app.d.userId,
        page: page,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var proList = res.data.prolist;//后台首推
        if (proList==''){
          return false;
        }
        that.setData({
          proList: that.data.proList.concat(proList),
          page: parseInt(page)+1,
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

  //   搜索
  suo: function () {
    wx.navigateTo({
      url: '../search/search',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },


  onReady: function () {
    //页面渲染完成
    wx.hideToast();
  },

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
