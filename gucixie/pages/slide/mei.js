// pages/user/dingdan.js
//index.js  
//获取应用实例  
var app = getApp();
//var common = require("../../utils/common.js");
Page({
  data: {
    winWidth: 0,
    winHeight: 0,
  
  // 切换
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0,
      ab: 0,
      agg:0
    },
    p: 0,
    t: 0,
    wu:5,
    page: 2,
    proList: [],
    orders:'',
    ptype: 1,
    catId: 0,
  },

  // tab切换
  tabFun: function (e) {
    //获取触发事件组件的dataset属性 
    var _datasetId = e.target.dataset.id;
    var _datasetp = e.target.dataset.p;
    var _datasett = e.target.dataset.t;

    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    //  第一个按（sort,销量，时间）排序
    if (_datasetId==0){
      _obj.ab = 0;
      this.setData({
        tabArr: _obj, 
        p: 0,
        t: 0,
        wu:0,
        page: 2,
        ptype: 1,
      });
    }
    //  第二个按 销量 排序
    if (_datasetId == 1 && _datasetp == 0) {
      _obj.agg = 0;
      _obj.ab = 4;
      this.setData({
        tabArr: _obj,
        p: 5,
        wu: 5,
        t:0,
        page: 2,
        ptype: 2
      });
    } else {
      _obj.agg = 0;
      var wu = this.data.wu
      _obj.ab = wu;
      this.setData({
        tabArr: _obj,
        p:0,
        page: 2,
      });
    }
    //  第三个按 价格 排序
    if (_datasetId == 2 && _datasett == 0 ) {
      _obj.ab = 0;
      _obj.agg = 4;
      this.setData({
        tabArr: _obj,
        wu: 0,
        t:5,
        page: 2,
        ptype: 3,
      });
    } else {
      var t = this.data.t
      _obj.agg = t;
      this.setData({
        tabArr: _obj,
        t: 0,
        page: 2,
      });
    }
    //  第4个按 添加时间 排序
    if (_datasetId == 3) {
      _obj.ab = 0;
      this.setData({
        tabArr: _obj,
        p: 0,
        t: 0,
        wu: 0,
        page: 2,
        ptype: 4,
      });
    }

    var orders = this.data.orders;
    var ptype = this.data.ptype;
    if (ptype ==1 ){
      this.setData({
        orders: 'zh',
      });
    } else if (ptype==2){
      if (orders == 'asale') {
        this.setData({
          orders: 'dsale',
        });
      } else {
        this.setData({
          orders: 'asale',
        });
      }
    }else if (ptype==3) {
      if (orders == 'aprice') {
        this.setData({
          orders: 'dprice',
        });
      } else {
        this.setData({
          orders: 'aprice',
        });
      }
    }else if (ptype=4){
      this.setData({
        orders: 'atime',
      });
    }
    this.loadOrderList();
  },

  onLoad: function (options) {
    var title = options.title;
    wx.setNavigationBarTitle({ title: title });
    var catId = options.cat_id;
    this.setData({
      catId: catId,
    });
  },

  onShow: function () {
    this.loadOrderList();
  },

  // getOrderStatus: function () {
  //   return this.data.currentTab == 0 ? 1 : this.data.currentTab == 2 ? 2 : this.data.currentTab == 3 ? 3 : 0;
  // },

  loadOrderList: function (e) {
    var that = this;
    console.log(that.data.orders);
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/lists',
      method: 'post',
      data: {
        cat_id: that.data.catId,
        orders: that.data.orders,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var data = res.data.pro;
        if (data==''){
          wx.showToast({
            title: '没有该分类下的商品！',
            duration: 2000
          });
          return false;
        }
        that.setData({
          proList: data,
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

  //页面触底事件
  onReachBottom: function () {
    var that = this;
    var page = that.data.page;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/get_more',
      method: 'post',
      data: {
        cat_id: that.data.catId,
        page: page,
        orders: that.data.orders
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var list = res.data.pro;
        if (list == '') {
          var len = that.data.proList.length;
          if (len > 0) {
            wx.showToast({
              title: '已经到底了！',
              duration: 2000
            });
          } else {
            wx.showToast({
              title: '没有找到更多数据！',
              duration: 2000
            });
          }
          return false;
        }
        that.setData({
          proList: that.data.proList.concat(list),
          page: parseInt(page) + 1
        });
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
      complete: function () {
        // complete
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    });
  },

  //跳转产品详情
  ti: function (e) {
    var pid = parseInt(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: '../product/product?productId=' + pid,
    });
  },

})