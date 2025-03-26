// pages/login/login.js
const app = getApp();
const request = require('../../utils/request.js');

Page({
  data: {
    loading: false,
    statusBarHeight: 0
  },

  onLoad() {
    // 获取状态栏高度，与其他页面保持一致的沉浸式体验
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      });
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
  },

  // 用户点击微信登录按钮
  handleWechatLogin() {
    this.setData({ loading: true });
    
    // 先获取用户信息
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息的用途
      success: (userInfoRes) => {
        // 获取到用户信息后，再获取登录凭证
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              // 将code和用户信息一起发送到服务器
              this.loginWithCodeAndUserInfo(loginRes.code, userInfoRes.userInfo);
            } else {
              this.setData({ loading: false });
              wx.showToast({
                title: '微信登录失败',
                icon: 'none'
              });
            }
          },
          fail: () => {
            this.setData({ loading: false });
            wx.showToast({
              title: '网络异常，请重试',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        this.setData({ loading: false });
        console.log('获取用户信息失败', err);
        // 用户拒绝授权，可以继续使用临时登录方式
        wx.showToast({
          title: '获取用户信息失败，将使用默认信息',
          icon: 'none',
          duration: 2000,
          complete: () => {
            // 如果用户拒绝，仍然可以继续登录流程，但使用默认信息
            wx.login({
              success: (loginRes) => {
                if (loginRes.code) {
                  this.loginWithCodeAndUserInfo(loginRes.code, null);
                } else {
                  wx.showToast({
                    title: '微信登录失败',
                    icon: 'none'
                  });
                }
              }
            });
          }
        });
      }
    });
  },

  // 将code和用户信息发送到服务端
  loginWithCodeAndUserInfo(code, userInfo) {
    // 开发调试模式开关
    const isDev = true; // 上线前改为false
    
    if (isDev) {
      // 模拟服务器响应的延迟
      setTimeout(() => {
        // 模拟服务器返回的数据
        const mockResponse = {
          token: 'mock_token_' + new Date().getTime(),
          userInfo: userInfo || {
            nickName: '陈志强',
            avatarUrl: '/assets/images/avatar.png',
            // 其他用户信息
          },
          points: 2680
        };
        
        // 保存登录态和用户信息
        wx.setStorageSync('token', mockResponse.token);
        app.globalData.isLoggedIn = true;
        app.globalData.userInfo = mockResponse.userInfo;
        app.globalData.points = mockResponse.points;
        
        console.log('模拟登录成功', mockResponse);
        this.setData({ loading: false });
        
        // 登录成功，跳转到首页
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1000); // 模拟网络延迟1秒
    } else {
      // 真实环境的代码
      request.post('/user/wechat-login', { 
        code: code,
        userInfo: userInfo // 将用户信息一并发送给服务端
      }, false)
        .then(res => {
          this.setData({ loading: false });
          
          // 保存登录态和用户信息
          wx.setStorageSync('token', res.token);
          app.globalData.isLoggedIn = true;
          
          if (res.userInfo) {
            app.globalData.userInfo = res.userInfo;
            app.globalData.points = res.points || 0;
          }
          
          // 登录成功，跳转到首页
          wx.switchTab({
            url: '/pages/index/index'
          });
        })
        .catch(() => {
          this.setData({ loading: false });
        });
    }
  },

  // 通过手机号码登录（可选实现）
  navigateToPhoneLogin() {
    wx.showToast({
      title: '手机号登录功能即将上线',
      icon: 'none'
    });
  }
});