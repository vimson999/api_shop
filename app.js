App({
  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
  },
  
  globalData: {
    userInfo: null,
    points: 0,
    isLoggedIn: false,
    apiBaseUrl: 'https://你的API服务器地址' // 替换为你的实际API地址
  },
  
  checkLoginStatus() {
    // 检查本地是否有token
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.isLoggedIn = true;
      // 获取用户信息和积分
      this.getUserInfo();
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
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络异常',
          icon: 'none'
        });
      }
    });
  }
});