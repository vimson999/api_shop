// 获取应用实例
const app = getApp();
const request = require('../../utils/request.js');

Page({
  data: {
    userInfo: {
      nickName: '陈志强' // 固定的假用户名
    },
    points: 2680, // 固定的假积分余额
    keyCount: 2, // 固定的假Key数量
    showNotice: true,
    showApiStatus: true,
    apiStatus: 'normal', // 'normal' 或 'error'
    consumeHistory: [
      { title: '图像生成 1024x1024', time: '2024-01-20 15:30:25', points: 15 },
      { title: '文本生成 2000字', time: '2024-01-20 15:28:12', points: 20 },
      { title: '语音转写 5分钟', time: '2024-01-20 15:25:43', points: 25 },
      { title: '图像生成 512x512', time: '2024-01-20 15:20:18', points: 10 },
      { title: '文本生成 1000字', time: '2024-01-20 15:15:32', points: 10 }
    ] // 固定的假消费记录
  },

  onLoad: function() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight;
    
    // 设置状态栏高度
    this.setData({
      statusBarHeight: statusBarHeight
    });
    
    // 原有代码保持不变
    if (app.globalData.isLoggedIn) {
      this.setData({
        userInfo: app.globalData.userInfo,
        points: app.globalData.points
      });
    }
  },
  
  onShow() {
    // 页面显示时刷新数据 - 暂时注释掉
    /*
    if (app.globalData.isLoggedIn) {
      this.refreshPoints();
      this.getKeyCount();
      this.getConsumeHistory();
    }
    */
  },
  
  // 刷新积分 - 现在只是刷新假数据的动画效果
  refreshPoints() {
    wx.showLoading({
      title: '刷新中',
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 500);
  },
  
  // 获取API Key数量
  getKeyCount() {
    if (!app.globalData.isLoggedIn) return;
    
    request.get('/user/apikeys/count', {}, false)
      .then(res => {
        this.setData({
          keyCount: res.count
        });
      })
      .catch(err => {
        console.error('获取API Key数量失败', err);
      });
  },
  
  // 获取消费记录
  getConsumeHistory() {
    if (!app.globalData.isLoggedIn) return;
    
    request.get('/user/points/history', { limit: 10 }, true)
      .then(res => {
        this.setData({
          consumeHistory: res.history
        });
      })
      .catch(err => {
        console.error('获取消费记录失败', err);
      });
  },
  
  // 切换系统公告显示
  toggleNotice() {
    this.setData({
      showNotice: !this.data.showNotice
    });
  },
  
  // 切换API状态显示
  toggleApiStatus() {
    this.setData({
      showApiStatus: !this.data.showApiStatus
    });
  },
  
  // 生成Key
  generateKey() {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '生成API Key',
      content: '确定要生成新的API Key吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/apiKey/generate/generate'
          });
        }
      }
    });
  },
  
  // 导航到购买积分页面
  navigateToBuyPoints() {
    wx.switchTab({
      url: '/pages/buyPoints/buyPoints'
    });
  },
  
  // 导航到API Key页面
  navigateToApiKey() {
    wx.switchTab({
      url: '/pages/apiKey/apiKey'
    });
  },
  
  // 显示文档中心即将上线的提示
  showDocComingSoon() {
    wx.showToast({
      title: '文档中心功能即将上线',
      icon: 'none',
      duration: 2000
    });
  }
});