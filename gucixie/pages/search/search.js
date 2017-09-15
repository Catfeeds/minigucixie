var app = getApp();
// pages/search/search.js
Page({
  data:{
    focus:true,
    hotKeyShow:true,
    historyKeyShow:true,
    searchValue:'',
    page:2,
    productData:[],
    historyKeyList:[],
    hotKeyList:[],
    showNosearch:false,
  },

  onLoad:function(options){
    
  },

  //页面显示事件
  onShow: function() {
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Search/index',
      method: 'post',
      data: { uid: app.d.userId },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var remen = res.data.remen;
        var history = res.data.history;
        that.setData({
          historyKeyList: history,
          hotKeyList: remen,
        });
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    })
  },

  doKeySearch:function(e){
    var key = e.currentTarget.dataset.key;
    this.setData({
      searchValue: key,
       hotKeyShow:false,
       historyKeyShow:false,
    });

    this.data.productData.length = 0;
    this.searchProductData();
  },
  doSearch:function(){
    var searchKey = this.data.searchValue;
    if (!searchKey) {
        this.setData({
            focus: true,
            hotKeyShow:true,
            historyKeyShow:true,
        });
        return;
    };

    this.setData({
      hotKeyShow:false,
      historyKeyShow:false,
    })
    
    this.data.productData.length = 0;
    this.searchProductData();

    this.getOrSetSearchHistory(searchKey);
  },
  getOrSetSearchHistory:function(key){
    var that = this;
    wx.getStorage({
      key: 'historyKeyList',
      success: function(res) {
          console.log(res.data);

          //console.log(res.data.indexOf(key))
          if(res.data.indexOf(key) >= 0){
            return;
          }

          res.data.push(key);
          wx.setStorage({
            key:"historyKeyList",
            data:res.data,
          });

          that.setData({
            historyKeyList:res.data,
            page: 2,
          });
      }
    });
  },
  searchValueInput:function(e){
    var value = e.detail.value;
    this.setData({
      searchValue:value,
      page: 2,
    });
    if(!value && this.data.productData.length == 0){
      this.setData({
        hotKeyShow:true,
        historyKeyShow:true,
      });
    }
  },
  searchProductData:function(){
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Search/searches',
      method:'post',
      data: {
        keyword:that.data.searchValue,
        uid: app.d.userId,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {   
        var data = res.data.pro;
        if (data==''){
          that.setData({
            showNosearch: true,
          });
        }
        that.setData({
          productData: data,
          page:2,
        });
      },
      fail:function(e){
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
      url: app.d.ceshiUrl + '/Api/Search/searches',
      method: 'post',
      data: {
        keyword: that.data.searchValue,
        uid: app.d.userId,
        page: page,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var data = res.data.pro;
        if (data==''){
          return false;
        }
        that.setData({
          productData: that.data.productData.concat(data),
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

});