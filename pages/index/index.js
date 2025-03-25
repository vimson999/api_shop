// index.js
const app = getApp();

Page({
  data: {
    userInfo: {
      nickName: '陈志强' // 按设计稿固定用户名
    },
    points: 2680, // 按设计稿固定积分
    keyCount: 2, // 按设计稿固定的API Key数量
    showNotice: true,
    showApiStatus: true,
    apiStatus: 'normal', // 'normal' 或 'error'
    statusBarHeight: 0, // 状态栏高度
    consumeHistory: [
      { title: '图像生成 1024x1024', time: '2024-01-20 15:30:25', points: 15 },
      { title: '文本生成 2000字', time: '2024-01-20 15:28:12', points: 20 },
      { title: '语音转写 5分钟', time: '2024-01-20 15:25:43', points: 25 },
      { title: '图像生成 512x512', time: '2024-01-20 15:20:18', points: 10 },
      { title: '文本生成 1000字', time: '2024-01-20 15:15:32', points: 10 }
    ] // 按设计稿固定的消费记录
  },

  onLoad: function() {
    // 获取系统信息
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      });
      console.log('状态栏高度:', systemInfo.statusBarHeight);
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
    
    // 检查头像资源是否存在
    wx.getFileSystemManager().access({
      path: '/assets/images/avatar.png',
      success: () => {
        console.log('头像资源存在');
      },
      fail: (err) => {
        console.error('头像资源不存在:', err);
        // 如果头像资源不存在，使用默认头像
        this.setData({
          'userInfo.avatarUrl': '/assets/images/default-avatar.png'
        });
      }
    });
    
    // 如果有登录信息则更新用户信息
    if (app.globalData.isLoggedIn) {
      this.setData({
        userInfo: app.globalData.userInfo,
        points: app.globalData.points
      });
    }
  },
  
  // 刷新积分
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