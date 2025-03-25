// app.js - 应用入口
App({
  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
  },
  
  globalData: {
    userInfo: null,
    points: 0,
    isLoggedIn: false,
    apiBaseUrl: 'https://api.example.com', // 替换为你的实际API地址
    mockApiKeys: [] // 用于存储模拟的API Keys
  },
  
  checkLoginStatus() {
    // 检查本地是否有token
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.isLoggedIn = true;
      // 获取用户信息和积分
      this.getUserInfo();

      // 检查当前页面是否为登录页
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1];
        // 如果已登录且在登录页，则跳转到首页
        if (currentPage.route === 'pages/login/login') {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }
      
      // 初始化模拟API Keys数据
      this.initMockApiKeys();
    } else {
      // 如果未登录，确保用户先进入登录页
      this.redirectToLogin();
    }
  },
  
  getUserInfo() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    wx.request({
      url: `${this.globalData.apiBaseUrl}/user/info`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.globalData.userInfo = res.data.userInfo;
          this.globalData.points = res.data.points;
        } else {
          // token可能已过期
          wx.removeStorageSync('token');
          this.globalData.isLoggedIn = false;
          this.redirectToLogin();
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络异常',
          icon: 'none'
        });
      }
    });
  },

  // 重定向到登录页
  redirectToLogin() {
    const pages = getCurrentPages();
    // 检查当前是否为登录页，避免重复跳转
    if (pages.length === 0 || pages[pages.length - 1].route !== 'pages/login/login') {
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }
  },
  
  // 初始化模拟API Keys数据
  initMockApiKeys() {
    // 从本地存储获取模拟API Keys
    const mockApiKeys = wx.getStorageSync('mockApiKeys');
    if (mockApiKeys && mockApiKeys.length > 0) {
      this.globalData.mockApiKeys = mockApiKeys;
    } else {
      // 初始化两个示例API Key
      const now = new Date();
      const expiryDate1 = new Date();
      expiryDate1.setMonth(expiryDate1.getMonth() + 6); // 6个月后过期
      
      const expiryDate2 = new Date();
      expiryDate2.setMonth(expiryDate2.getMonth() + 12); // 12个月后过期
      
      this.globalData.mockApiKeys = [
        {
          id: 'ak_' + Math.random().toString(36).substr(2, 9),
          name: '测试应用',
          status: 'active',
          createdAt: now.toISOString(),
          expiresAt: expiryDate1.toISOString(),
          key: 'sk_test_' + Math.random().toString(36).substr(2, 32)
        },
        {
          id: 'ak_' + Math.random().toString(36).substr(2, 9),
          name: '生产应用',
          status: 'active',
          createdAt: now.toISOString(),
          expiresAt: expiryDate2.toISOString(),
          key: 'sk_live_' + Math.random().toString(36).substr(2, 32)
        }
      ];
      
      // 保存到本地存储
      wx.setStorageSync('mockApiKeys', this.globalData.mockApiKeys);
    }
  }
});