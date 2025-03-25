// pages/apiKey/apiKey.js
const app = getApp();
const auth = require('../../utils/auth.js');
const { mockApiKeyService } = require('../../utils/mock-service.js');

Page({
  data: {
    statusBarHeight: 0,
    apiKeys: [],
    loading: true,
    showCreateModal: false,
    showSuccessModal: false,
    newKeyName: '',
    expiryOptions: [
      { id: 1, name: '1个月', value: 1 },
      { id: 3, name: '3个月', value: 3 },
      { id: 6, name: '6个月', value: 6 },
      { id: 12, name: '1年', value: 12 }
    ],
    selectedExpiryId: 6, // 默认选择6个月
    newApiKey: null,
    keySaved: false,
    confirmDeleteId: null, // 待删除的API Key ID
    showDeleteConfirm: false
  },

  onLoad: function(options) {
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
    
    // 加载API Keys
    this.loadApiKeys();
  },
  
  onShow: function() {
    // 在页面显示时再次检查登录状态
    auth.checkOnShow(this);
    
    // 刷新API Keys
    this.loadApiKeys();
  },
  
  // 加载API Keys
  loadApiKeys: function() {
    this.setData({ loading: true });
    
    mockApiKeyService.getApiKeys()
      .then(apiKeys => {
        this.setData({
          apiKeys,
          loading: false
        });
      })
      .catch(error => {
        console.error('获取API Keys失败:', error);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      });
  },
  
  // 打开创建API Key模态框
  showCreateApiKey: function() {
    this.setData({
      showCreateModal: true,
      newKeyName: '',
      selectedExpiryId: 6 // 重置为默认值
    });
  },
  
  // 关闭创建API Key模态框
  closeCreateModal: function() {
    this.setData({
      showCreateModal: false
    });
  },
  
  // 处理API Key名称输入
  onKeyNameInput: function(e) {
    this.setData({
      newKeyName: e.detail.value
    });
  },
  
  // 选择过期时间
  selectExpiry: function(e) {
    const expiryId = parseInt(e.currentTarget.dataset.id);
    this.setData({
      selectedExpiryId: expiryId
    });
  },
  
  // 创建API Key
  createApiKey: function() {
    if (!this.data.newKeyName.trim()) {
      wx.showToast({
        title: '请输入API Key名称',
        icon: 'none'
      });
      return;
    }
    
    const selectedExpiry = this.data.expiryOptions.find(
      option => option.id === this.data.selectedExpiryId
    );
    
    // 计算过期时间
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + selectedExpiry.value);
    
    wx.showLoading({
      title: '创建中',
      mask: true
    });
    
    mockApiKeyService.createApiKey({
      name: this.data.newKeyName,
      expiresAt: expiryDate.toISOString()
    })
      .then(newApiKey => {
        wx.hideLoading();
        
        this.setData({
          showCreateModal: false,
          showSuccessModal: true,
          newApiKey,
          keySaved: false
        });
        
        // 刷新API Keys列表
        this.loadApiKeys();
      })
      .catch(error => {
        wx.hideLoading();
        console.error('创建API Key失败:', error);
        wx.showToast({
          title: '创建失败，请重试',
          icon: 'none'
        });
      });
  },
  
  // 复制API Key到剪贴板
  copyApiKey: function() {
    if (!this.data.newApiKey) return;
    
    wx.setClipboardData({
      data: this.data.newApiKey.key,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },
  
  // 切换"我已保存"复选框
  toggleKeySaved: function() {
    this.setData({
      keySaved: !this.data.keySaved
    });
  },
  
  // 关闭成功模态框
  closeSuccessModal: function() {
    if (!this.data.keySaved) {
      wx.showModal({
        title: '提示',
        content: '请确认您已保存API Key，关闭后将无法再次查看',
        confirmText: '我已保存',
        cancelText: '返回保存',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              showSuccessModal: false,
              newApiKey: null
            });
          }
        }
      });
    } else {
      this.setData({
        showSuccessModal: false,
        newApiKey: null
      });
    }
  },
  
  // 显示删除确认对话框
  showDeleteConfirm: function(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      confirmDeleteId: id,
      showDeleteConfirm: true
    });
  },
  
  // 关闭删除确认对话框
  closeDeleteConfirm: function() {
    this.setData({
      showDeleteConfirm: false,
      confirmDeleteId: null
    });
  },
  
  // 删除API Key
  deleteApiKey: function() {
    if (!this.data.confirmDeleteId) return;
    
    wx.showLoading({
      title: '删除中',
      mask: true
    });
    
    mockApiKeyService.deleteApiKey(this.data.confirmDeleteId)
      .then(result => {
        wx.hideLoading();
        this.setData({
          showDeleteConfirm: false,
          confirmDeleteId: null
        });
        
        if (result.success) {
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
          
          // 刷新API Keys列表
          this.loadApiKeys();
        } else {
          wx.showToast({
            title: result.message || '删除失败',
            icon: 'none'
          });
        }
      })
      .catch(error => {
        wx.hideLoading();
        console.error('删除API Key失败:', error);
        this.setData({
          showDeleteConfirm: false,
          confirmDeleteId: null
        });
        wx.showToast({
          title: '删除失败，请重试',
          icon: 'none'
        });
      });
  },
  
  // 切换API Key状态（激活/禁用）
  toggleApiKeyStatus: function(e) {
    const id = e.currentTarget.dataset.id;
    const currentStatus = e.currentTarget.dataset.status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    wx.showLoading({
      title: newStatus === 'active' ? '激活中' : '禁用中',
      mask: true
    });
    
    mockApiKeyService.updateApiKeyStatus(id, newStatus)
      .then(result => {
        wx.hideLoading();
        
        if (result.success) {
          wx.showToast({
            title: newStatus === 'active' ? '已激活' : '已禁用',
            icon: 'success'
          });
          
          // 刷新API Keys列表
          this.loadApiKeys();
        } else {
          wx.showToast({
            title: result.message || '操作失败',
            icon: 'none'
          });
        }
      })
      .catch(error => {
        wx.hideLoading();
        console.error('更新API Key状态失败:', error);
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      });
  },
  
  // 格式化日期显示
  formatDate: function(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});