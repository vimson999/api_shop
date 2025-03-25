// pages/buyPoints/buyPoints.js
const app = getApp();
const auth = require('../../utils/auth.js');
const { mockPointService } = require('../../utils/mock-point-service.js');

Page({
  data: {
    statusBarHeight: 0,
    currentTab: 0, // 0: 推荐套餐, 1: 购买记录, 2: 积分消耗
    
    // 积分信息
    points: 0,
    expiryDate: '',
    
    // 套餐信息
    packages: [],
    selectedPackageId: '',
    
    // 历史记录
    purchaseHistory: [],
    consumptionHistory: [],
    
    // 加载状态
    loading: true,
    loadingHistory: false,
    
    // 订单确认
    showOrderConfirm: false,
    selectedPackage: null,
    
    // 支付状态
    paymentLoading: false,
    
    // 支付成功
    showPaymentSuccess: false,
    paymentResult: null,
    
    // 标签名称
    tabs: ['推荐套餐', '购买记录', '积分消耗'],
    
    // 按钮禁用状态（防误触）
    btnDisabled: false
  },
  
  onLoad: function() {
    // 检查登录状态
    if (!auth.checkAuth(this)) {
      return;
    }
    
    // 获取系统信息
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      });
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
    
    // 加载积分信息和套餐列表
    this.loadPointsInfo();
    this.loadPackages();
  },
  
  onShow: function() {
    // 检查登录状态
    auth.checkOnShow(this);
  },
  
  // 加载积分信息
  loadPointsInfo: function() {
    mockPointService.getUserPoints()
      .then(data => {
        this.setData({
          points: data.points,
          expiryDate: this.formatDate(data.expiryDate)
        });
      })
      .catch(error => {
        console.error('获取积分信息失败:', error);
        wx.showToast({
          title: '获取积分信息失败',
          icon: 'none'
        });
      });
  },
  
  // 加载套餐列表
  loadPackages: function() {
    this.setData({ loading: true });
    
    mockPointService.getPackages()
      .then(packages => {
        this.setData({
          packages,
          loading: false,
          // 默认选择热销套餐
          selectedPackageId: packages.find(pkg => pkg.isHot)?.id || packages[0]?.id || ''
        });
      })
      .catch(error => {
        console.error('获取套餐列表失败:', error);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取套餐列表失败',
          icon: 'none'
        });
      });
  },
  
  // 加载购买历史
  loadPurchaseHistory: function() {
    this.setData({ loadingHistory: true });
    
    mockPointService.getPurchaseHistory()
      .then(history => {
        this.setData({
          purchaseHistory: history,
          loadingHistory: false
        });
      })
      .catch(error => {
        console.error('获取购买记录失败:', error);
        this.setData({ loadingHistory: false });
        wx.showToast({
          title: '获取购买记录失败',
          icon: 'none'
        });
      });
  },
  
  // 加载消费历史
  loadConsumptionHistory: function() {
    this.setData({ loadingHistory: true });
    
    mockPointService.getPointsConsumptionHistory()
      .then(history => {
        this.setData({
          consumptionHistory: history,
          loadingHistory: false
        });
      })
      .catch(error => {
        console.error('获取消费记录失败:', error);
        this.setData({ loadingHistory: false });
        wx.showToast({
          title: '获取消费记录失败',
          icon: 'none'
        });
      });
  },
  
  // 切换标签页
  switchTab: function(e) {
    const tabIndex = parseInt(e.currentTarget.dataset.index);
    
    if (tabIndex === this.data.currentTab) return;
    
    this.setData({ currentTab: tabIndex });
    
    // 根据当前标签页加载对应数据
    if (tabIndex === 1 && this.data.purchaseHistory.length === 0) {
      this.loadPurchaseHistory();
    } else if (tabIndex === 2 && this.data.consumptionHistory.length === 0) {
      this.loadConsumptionHistory();
    }
  },
  
  // 选择套餐
  selectPackage: function(e) {
    const packageId = e.currentTarget.dataset.id;
    
    // 防止快速多次点击
    if (this.data.btnDisabled) return;
    
    this.setData({
      selectedPackageId: packageId,
      btnDisabled: true
    });
    
    // 1秒后启用按钮
    setTimeout(() => {
      this.setData({ btnDisabled: false });
    }, 1000);
  },
  
  // 显示广告获取积分的提示
  showAdPointsHint: function() {
    wx.showToast({
      title: '广告积分功能即将上线',
      icon: 'none'
    });
  },
  
  // 点击购买按钮
  buyPackage: function(e) {
    const packageId = e.currentTarget.dataset.id || this.data.selectedPackageId;
    const selectedPackage = this.data.packages.find(pkg => pkg.id === packageId);
    
    if (!selectedPackage) {
      wx.showToast({
        title: '请选择套餐',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedPackage,
      showOrderConfirm: true
    });
  },
  
  // 关闭订单确认窗口
  closeOrderConfirm: function() {
    this.setData({
      showOrderConfirm: false,
      selectedPackage: null
    });
  },
  
  // 发起支付
  initiatePayment: function() {
    if (!this.data.selectedPackage) return;
    
    this.setData({ paymentLoading: true });
    
    // 创建订单
    mockPointService.createOrder(this.data.selectedPackage.id)
      .then(orderResult => {
        if (orderResult.success) {
          // 模拟微信支付过程
          setTimeout(() => {
            // 完成支付
            mockPointService.completePayment(orderResult.orderId)
              .then(payResult => {
                this.setData({ 
                  paymentLoading: false,
                  showOrderConfirm: false,
                  showPaymentSuccess: true,
                  paymentResult: {
                    package: this.data.selectedPackage,
                    points: payResult.points,
                    expiryDate: this.formatDate(payResult.expiryDate)
                  }
                });
                
                // 更新积分信息
                this.setData({
                  points: payResult.points,
                  expiryDate: this.formatDate(payResult.expiryDate)
                });
                
                // 更新订单历史
                if (this.data.currentTab === 1) {
                  this.loadPurchaseHistory();
                }
              })
              .catch(error => {
                console.error('支付完成处理失败:', error);
                this.setData({ paymentLoading: false });
                wx.showToast({
                  title: '支付处理失败',
                  icon: 'none'
                });
              });
          }, 2000);
        } else {
          this.setData({ paymentLoading: false });
          wx.showToast({
            title: orderResult.message || '创建订单失败',
            icon: 'none'
          });
        }
      })
      .catch(error => {
        console.error('创建订单失败:', error);
        this.setData({ paymentLoading: false });
        wx.showToast({
          title: '创建订单失败',
          icon: 'none'
        });
      });
  },
  
  // 关闭支付成功窗口
  closePaymentSuccess: function() {
    this.setData({
      showPaymentSuccess: false,
      paymentResult: null
    });
  },
  
  // 跳转到首页
  navigateToIndex: function() {
    this.closePaymentSuccess();
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  
  // 格式化日期
  formatDate: function(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  },
  
  // 格式化价格（添加千位分隔符）
  formatPrice: function(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
});