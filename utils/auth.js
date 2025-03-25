// utils/auth.js
const app = getApp();

/**
 * 检查登录状态
 * @param {Object} pageThis - 页面的this引用
 */
const checkAuth = (pageThis) => {
  if (!app.globalData.isLoggedIn) {
    wx.redirectTo({
      url: '/pages/login/login'
    });
    return false;
  }
  return true;
};

/**
 * 添加到页面的onShow生命周期中以检查登录状态
 * 使用方法：
 * 1. 导入此模块: const auth = require('../../utils/auth.js');
 * 2. 在onShow中调用: auth.checkOnShow(this);
 */
const checkOnShow = (pageThis) => {
  const token = wx.getStorageSync('token');
  if (!token) {
    app.globalData.isLoggedIn = false;
    wx.redirectTo({
      url: '/pages/login/login'
    });
    return false;
  }
  return true;
};

module.exports = {
  checkAuth,
  checkOnShow
};