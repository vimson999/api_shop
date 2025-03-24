const app = getApp();

// 封装请求方法
const request = (url, method, data, showLoading = true) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    if (showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
    }
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (showLoading) {
          wx.hideLoading();
        }
        
        if (res.statusCode === 401) {
          // 未授权，清除token并跳转登录
          wx.removeStorageSync('token');
          app.globalData.isLoggedIn = false;
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          });
          // 这里可以添加登录跳转逻辑
          reject(new Error('未登录'));
          return;
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading();
        }
        wx.showToast({
          title: '网络异常',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

// 导出常用请求方法
module.exports = {
  get: (url, data, showLoading) => request(url, 'GET', data, showLoading),
  post: (url, data, showLoading) => request(url, 'POST', data, showLoading),
  put: (url, data, showLoading) => request(url, 'PUT', data, showLoading),
  delete: (url, data, showLoading) => request(url, 'DELETE', data, showLoading)
};