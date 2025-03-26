// pages/user/user.js
const app = getApp();
const auth = require('../../utils/auth.js');

Page({
  data: {
    userInfo: {
      nickName: '陈志强', // 默认用户名
      avatarUrl: '/assets/images/default-avatar.png' // 默认头像
    },
    statusBarHeight: 0,
    bindingStatus: {
      phone: false,
      email: false
    }
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
    
    // 加载用户信息
    this.loadUserInfo();
  },
  
  onShow: function() {
    // 在页面显示时再次检查登录状态
    auth.checkOnShow(this);
    
    // 刷新用户信息
    this.loadUserInfo();
  },
  
  // 加载用户信息
  loadUserInfo: function() {
    // 如果有登录信息则更新用户信息
    if (app.globalData.isLoggedIn && app.globalData.userInfo) {
      this.setData({
        userInfo: {
          nickName: app.globalData.userInfo.nickName || this.data.userInfo.nickName,
          avatarUrl: app.globalData.userInfo.avatarUrl || '/assets/images/default-avatar.png'
        }
      });
    }
    
    // 模拟获取绑定状态
    setTimeout(() => {
      this.setData({
        bindingStatus: {
          phone: false, // 模拟未绑定手机
          email: false  // 模拟未绑定邮箱
        }
      });
    }, 500);
  },
  
  // 点击关于我们
  navigateToAbout: function() {
    wx.showToast({
      title: '关于我们功能即将上线',
      icon: 'none'
    });
  },
  
  // 点击用户协议
  navigateToUserAgreement: function() {
    wx.showToast({
      title: '用户协议功能即将上线',
      icon: 'none'
    });
  },
  
  // 退出登录
  logout: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.removeStorageSync('token');
          app.globalData.isLoggedIn = false;
          app.globalData.userInfo = null;
          
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
});