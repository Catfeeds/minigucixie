//index.js  
//获取应用实例  
var app = getApp();
//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');
Page({

  data:{
    productId:0,
    itemData:{},
    bannerItem: [],
    buynum:1,
    // 产品图片轮播
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    // 属性选择
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
     firstIndex: -1,
     commodityAttr: [],
     attrValueList: [],
     clicktype: '',
     comment:[]
  },
shuxing:function(e){
    var id=e.currentTarget.dataset.id
    var i = true;
    this. setData({
      shuxing:i,
      png:1,
      id:1,
    })
    if (id==1) {
      var i = false;
      this.setData({
        shuxing: i,
        png: 0,
        id: 0,
      })
    }

},

  // 弹窗
  setModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })

    var clicktype = e.currentTarget.dataset.type;
    this.setData({
      clicktype: clicktype,
    });

    this.animation = animation
    animation.translateY(300).step();
    
    this.setData({
      animationData: animation.export()
    })

    if (e.currentTarget.dataset.status == 1) {

      this.setData(
        {
          showModalStatus: true
        }
      );
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)
  },
  // 加减
  changeNum:function  (e) {
    var that = this;
    if (e.target.dataset.alphaBeta == 0) {
        if (this.data.buynum <= 1) {
            buynum:1
        }else{
            this.setData({
                buynum:this.data.buynum - 1
            })
        };
    }else{
        this.setData({
            buynum:this.data.buynum + 1
        })
    };
  },
  // 传值
  onLoad: function (option) {     
    //this.initNavHeight();
    var that = this;
    that.setData({
      productId: option.productId,
    });
  },

// 属性选择
  onShow: function () {
    this.loadProductDetail();
  },

  // 商品详情数据获取
  loadProductDetail: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    })
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/index',
      method: 'post',
      data: {
        pro_id: that.data.productId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data.comment)
        var status = res.data.status;
        if (status == 1) {
          var pro = res.data.pro;
          var content = pro.content;
          var buff = res.data.buff;
          WxParse.wxParse('content', 'html', content, that, 8);
          that.setData({
            itemData: pro,
            bannerItem: pro.img_arr,
            commodityAttr: buff,
            includeGroup: buff,
            comment: res.data.comment
          });
          that.distachAttrValue(buff);
          // 只有一个属性组合的时候默认选中
          if (buff.length == 1) {
            for (var i = 0; i < buff[0].attrValueList.length; i++) {
              that.data.attrValueList[i].selectedValue = buff[0].attrValueList[i].attrValue;
            }
            that.setData({
              attrValueList: that.data.attrValueList
            });
          }
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000,
          });
        }
      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
        });
      },
    });
  },

  /* 获取数据 */
  distachAttrValue: function (commodityAttr) {
    /**
      将后台返回的数据组合成类似
      {
        attrKey:'型号',
        attrValueList:['1','2','3']
      }
    */
    // 把数据对象的数据（视图使用），写到局部内
    var attrValueList = this.data.attrValueList;
    // 遍历获取的数据
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        var attrIndex = this.getAttrIndex(commodityAttr[i].attrValueList[j].attrKey, attrValueList);
        // console.log('属性索引', attrIndex); 
        // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理
          if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrValue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(commodityAttr[i].attrValueList[j].attrValue);
          }
        } else {
          attrValueList.push({
            attrKey: commodityAttr[i].attrValueList[j].attrKey,
            attrValues: [commodityAttr[i].attrValueList[j].attrValue]
          });
        }
      }
    }
    // console.log('result', attrValueList)
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }
    this.setData({
      attrValueList: attrValueList
    });
  },
  getAttrIndex: function (attrName, attrValueList) {
    // 判断数组中的attrKey是否有该属性值
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist: function (value, valueArr) {
    // 判断是否已有属性值
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  /* 选择属性值事件 */
  selectAttrValue: function (e) {
    /*
    点选属性值，联动判断其他属性值是否可选
    {
      attrKey:'型号',
      attrValueList:['1','2','3'],
      selectedValue:'1',
      attrValueStatus:[true,true,true]
    }
    console.log(e.currentTarget.dataset);
    */
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index;//属性索引
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中
        this.disSelectValue(attrValueList, index, key, value);
      } else {
        // 选中
        this.selectValue(attrValueList, index, key, value);
      }

    }
  },
  /* 选中 */
  selectValue: function (attrValueList, index, key, value, unselectStatus) {
    // console.log('firstIndex', this.data.firstIndex);
    var includeGroup = [];
    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
      var commodityAttr = this.data.commodityAttr;
      // 其他选中的属性值全都置空
      // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus);
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }

    // console.log('选中', commodityAttr, index, key, value);
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
        }
      }
    }
    attrValueList[index].selectedValue = value;

    // 判断属性是否可选
    // for (var i = 0; i < attrValueList.length; i++) {
    //   for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
    //     attrValueList[i].attrValueStatus[j] = false;
    //   }
    // }
    // for (var k = 0; k < attrValueList.length; k++) {
    //   for (var i = 0; i < includeGroup.length; i++) {
    //     for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
    //       if (attrValueList[k].attrKey == includeGroup[i].attrValueList[j].attrKey) {
    //         for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
    //           if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrValue) {
    //             attrValueList[k].attrValueStatus[m] = true;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
    
    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup
    });
    this.changeInfo();

    var count = 0;
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) {// 第一次选中，同属性的值都可选
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  /* 取消选中 */
  disSelectValue: function (attrValueList, index, key, value) {
    var commodityAttr = this.data.commodityAttr;
    attrValueList[index].selectedValue = '';

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    this.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
      }
    }
  },

//添加到收藏
  addFavorites:function(e){
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/col',
      method:'post',
      data: {
        uid: app.d.userId,
        pid: that.data.productId,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // //--init data        
        var data = res.data;
        if(data.status == 1){
          wx.showToast({
            title: '操作成功！',
            duration: 2000
          });
          //变成已收藏，但是目前小程序可能不能改变图片，只能改样式
          that.data.itemData.isCollect = true;
        }else{
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

  //加入购物车
  addShopCart:function(e){ 
    var that = this;
    var is_buff = that.data.itemData.is_buff;
    var buff = that.data.commodityAttr;
    if (is_buff > 0 && buff!='') {
      var attrlist = that.data.attrValueList;
      var attrstr = '';
      for(var i=0;i<attrlist.length;i++){
        if (!attrlist[i].selectedValue) {
          wx.showToast({
            title: '请选择' + attrlist[i].attrKey,
            duration: 2000
          });
          return false;
        } else {
          attrstr += attrlist[i].selectedValue+',';
        }
      }
    }

    var stock = that.data.itemData.num;
    var buynum = that.data.buynum;
    if (buynum>stock) {
      wx.showToast({
        title: '库存不足！',
        duration: 2000
      });
      return false;
    }
    var ptype = e.currentTarget.dataset.type;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Shopping/add',
      method:'post',
      data: {
        uid: app.d.userId,
        pid: that.data.productId,
        num: buynum,
        attr: attrstr,
        ptype: ptype,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {     
        var data = res.data;
        if(data.status == 1){
          if(ptype == 'buynow'){
            wx.redirectTo({
              url: '../pay/pay?cartId='+data.cart_id
            });
            return;
          }else{
            wx.showToast({
                title: '加入购物车成功',
                icon: 'success',
                duration: 2000
            });
          }     
        }else{
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

  //根据产品属性变动价格
  changeInfo: function() {
    wx.showToast({
      title: '价格获取中..',
      icon: 'loading',
    })
    var that = this;
    var attrlist = that.data.attrValueList;
    var attrstr = '';
    if (attrlist) {
      for (var i = 0; i < attrlist.length; i++) {
          attrstr += attrlist[i].selectedValue + ',';
      }
    
      wx.request({
        url: app.d.ceshiUrl + '/Api/Product/getprice',
        method: 'post',
        data: {
          pid: that.data.productId,
          attrs: attrstr,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          var data = res.data;
          var info = that.data.itemData;
          if (data.status == 1) {
            info.price_yh = data.price;
            info.num = data.stock;
            that.setData({
              itemData: info
            });
            wx.hideToast();
          } 
        },
        fail: function (e) {
          // fail
          wx.hideToast();
        }
      });
    }
  },

  bindChange: function (e) {//滑动切换tab 
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },

  initNavHeight:function(){////获取系统信息
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  bannerClosed:function(){
    this.setData({
      bannerApp:false,
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

  onReady: function (){
    //页面渲染完成
    wx.hideToast();
  },

  onShareAppMessage: function () {
    var title = this.data.itemData.name;
    var id = this.data.itemData.id;
    return {
      title: title,
      path: '/pages/product/product?productId='+id,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  }
});
