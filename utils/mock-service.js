// utils/mock-service.js
const app = getApp();

// API Key模拟服务
const mockApiKeyService = {
  // 获取所有API Keys
  getApiKeys() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...app.globalData.mockApiKeys]);
      }, 500);
    });
  },
  
  // 创建新API Key
  createApiKey(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const expiryDate = new Date(data.expiresAt || now.setMonth(now.getMonth() + 6));
        
        // 生成新的API Key
        const newApiKey = {
          id: 'ak_' + Math.random().toString(36).substr(2, 9),
          name: data.name || '未命名API Key',
          status: 'active',
          createdAt: now.toISOString(),
          expiresAt: expiryDate.toISOString(),
          key: 'sk_' + (data.name ? data.name.substr(0, 4).toLowerCase() + '_' : '') + Math.random().toString(36).substr(2, 32)
        };
        
        // 添加到全局数据
        app.globalData.mockApiKeys.push(newApiKey);
        
        // 保存到本地存储
        wx.setStorageSync('mockApiKeys', app.globalData.mockApiKeys);
        
        // 返回新创建的API Key
        resolve({...newApiKey});
      }, 800);
    });
  },
  
  // 删除API Key
  deleteApiKey(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 从数组中找到并删除指定ID的API Key
        const index = app.globalData.mockApiKeys.findIndex(key => key.id === id);
        
        if (index !== -1) {
          app.globalData.mockApiKeys.splice(index, 1);
          
          // 更新本地存储
          wx.setStorageSync('mockApiKeys', app.globalData.mockApiKeys);
          
          resolve({ success: true });
        } else {
          resolve({ success: false, message: '未找到指定的API Key' });
        }
      }, 600);
    });
  },
  
  // 更新API Key状态
  updateApiKeyStatus(id, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 从数组中找到并更新指定ID的API Key状态
        const apiKey = app.globalData.mockApiKeys.find(key => key.id === id);
        
        if (apiKey) {
          apiKey.status = status;
          
          // 更新本地存储
          wx.setStorageSync('mockApiKeys', app.globalData.mockApiKeys);
          
          resolve({ success: true });
        } else {
          resolve({ success: false, message: '未找到指定的API Key' });
        }
      }, 500);
    });
  }
};

module.exports = {
  mockApiKeyService
};