// utils/mock-point-service.js
const app = getApp();

// 获取当前日期加一年的时间
const getDefaultExpiryDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
};

// 积分相关模拟服务
const mockPointService = {
  // 获取用户积分信息
  getUserPoints() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 生成模拟的积分有效期（默认为一年后）
        const expiryDate = wx.getStorageSync('pointExpiryDate') || getDefaultExpiryDate();
        
        resolve({
          points: app.globalData.points || 1200,
          expiryDate: expiryDate
        });
      }, 500);
    });
  },
  
  // 获取可购买的套餐列表
  getPackages() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'pkg_basic',
            name: '基础套餐',
            points: 300,
            price: 30,
            discount: 0,
            isHot: false,
            description: '基础积分套餐，适合轻度使用'
          },
          {
            id: 'pkg_standard',
            name: '标准套餐',
            points: 600,
            price: 50,
            discount: 20,
            isHot: true,
            description: '热销套餐，性价比最高'
          },
          {
            id: 'pkg_premium',
            name: '高级套餐',
            points: 1200,
            price: 90,
            discount: 25,
            isHot: false,
            description: '高级套餐，适合大量使用API'
          },
          {
            id: 'pkg_ultimate',
            name: '旗舰套餐',
            points: 3000,
            price: 199,
            discount: 30,
            isHot: false,
            description: '旗舰套餐，提供最多积分'
          }
        ]);
      }, 600);
    });
  },
  
  // 模拟购买记录
  getPurchaseHistory() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 从本地存储获取购买记录
        const history = wx.getStorageSync('purchaseHistory') || [];
        resolve(history);
      }, 700);
    });
  },
  
  // 获取积分消耗记录
  getPointsConsumptionHistory() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { title: '图像生成 1024x1024', time: '2024-01-20 15:30:25', points: 15 },
          { title: '文本生成 2000字', time: '2024-01-20 15:28:12', points: 20 },
          { title: '语音转写 5分钟', time: '2024-01-20 15:25:43', points: 25 },
          { title: '图像生成 512x512', time: '2024-01-20 15:20:18', points: 10 },
          { title: '文本生成 1000字', time: '2024-01-20 15:15:32', points: 10 },
          { title: '文本摘要生成', time: '2024-01-19 14:20:18', points: 8 },
          { title: '图像生成 256x256', time: '2024-01-19 13:15:32', points: 5 },
          { title: '语音转写 10分钟', time: '2024-01-18 16:25:43', points: 50 },
          { title: '文本翻译 5000字', time: '2024-01-18 12:18:12', points: 30 },
          { title: '图像修复 1024x1024', time: '2024-01-17 10:30:25', points: 20 }
        ]);
      }, 800);
    });
  },
  
  // 模拟支付流程
  createOrder(packageId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 查找对应的套餐
        mockPointService.getPackages().then(packages => {
          const selectedPackage = packages.find(pkg => pkg.id === packageId);
          
          if (selectedPackage) {
            const orderId = 'order_' + Date.now();
            
            // 将订单信息存储到本地，模拟订单创建
            const order = {
              id: orderId,
              packageId: selectedPackage.id,
              packageName: selectedPackage.name,
              points: selectedPackage.points,
              price: selectedPackage.price,
              status: 'pending',
              createTime: new Date().toISOString()
            };
            
            const orders = wx.getStorageSync('orders') || [];
            orders.push(order);
            wx.setStorageSync('orders', orders);
            
            resolve({
              success: true,
              orderId: orderId,
              package: selectedPackage
            });
          } else {
            resolve({
              success: false,
              message: '未找到对应的套餐'
            });
          }
        });
      }, 1000);
    });
  },
  
  // 模拟支付完成
  completePayment(orderId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 获取订单信息
        const orders = wx.getStorageSync('orders') || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
          // 更新订单状态
          orders[orderIndex].status = 'paid';
          orders[orderIndex].payTime = new Date().toISOString();
          wx.setStorageSync('orders', orders);
          
          // 更新用户积分
          const points = app.globalData.points || 0;
          app.globalData.points = points + orders[orderIndex].points;
          
          // 设置积分有效期（默认为一年后）
          const expiryDate = getDefaultExpiryDate();
          wx.setStorageSync('pointExpiryDate', expiryDate);
          
          // 添加到购买记录
          const purchaseHistory = wx.getStorageSync('purchaseHistory') || [];
          purchaseHistory.unshift({
            orderId: orders[orderIndex].id,
            packageName: orders[orderIndex].packageName,
            points: orders[orderIndex].points,
            price: orders[orderIndex].price,
            purchaseTime: new Date().toISOString()
          });
          wx.setStorageSync('purchaseHistory', purchaseHistory);
          
          resolve({
            success: true,
            points: app.globalData.points,
            expiryDate: expiryDate
          });
        } else {
          resolve({
            success: false,
            message: '订单不存在'
          });
        }
      }, 1500);
    });
  }
};

module.exports = {
  mockPointService
};