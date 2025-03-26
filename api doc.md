API积分商城 - 接口文档
接口规范
基本信息

服务基础URL: https://api.example.com (需替换为实际环境地址)
开发环境: https://dev-api.example.com
测试环境: https://test-api.example.com
生产环境: https://api.example.com

请求头规范
所有需要鉴权的接口都需要在请求头中携带token：
CopyAuthorization: Bearer {token}
Content-Type: application/json
响应格式规范
所有接口返回格式统一为：
jsonCopy{
  "code": 0,       // 状态码，0表示成功，非0表示失败
  "message": "",   // 状态描述
  "data": {}       // 响应数据，可能是对象或数组
}
常见状态码

0: 成功
401: 未登录或登录已过期
403: 权限不足
404: 资源不存在
422: 参数错误
500: 服务器内部错误

1. 用户认证与授权接口
1.1 微信登录

接口路径: /api/v1/auth/wechat-login
请求方式: POST
接口说明: 使用微信登录获取的临时code换取应用自身的登录态
微信前置接口: 小程序端需先调用 wx.login() 获取临时code
请求参数:
jsonCopy{
  "code": "string", // 微信登录获取的临时code
  "encryptedData": "string", // 可选，包含敏感数据的加密数据，需要通过wx.getUserProfile获取（如果需要用户信息）
  "iv": "string" // 可选，加密算法的初始向量
}

响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "token": "string", // 登录令牌
    "expiresIn": 7200, // token有效期（秒）
    "userInfo": {
      "userId": "string", // 用户ID
      "nickName": "string", // 用户昵称
      "avatarUrl": "string"  // 用户头像
    },
    "points": 0, // 用户积分
    "isNewUser": false // 是否为新用户
  }
}

错误码:

422: 参数错误或code无效
500: 服务器处理错误



1.2 刷新登录态

接口路径: /api/v1/auth/refresh-token
请求方式: POST
请求头: 需要携带过期token
请求参数: 无
响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "token": "string", // 新的登录令牌
    "expiresIn": 7200  // token有效期（秒）
  }
}


1.3 获取用户信息

接口路径: /api/v1/user/info
请求方式: GET
请求头: 需要携带token
响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "userInfo": {
      "userId": "string",
      "nickName": "string",
      "avatarUrl": "string",
      "bindingStatus": {
        "phone": false, // 是否已绑定手机
        "email": false  // 是否已绑定邮箱
      }
    },
    "points": 0,
    "pointsExpiryDate": "2024-12-31T23:59:59Z" // ISO格式日期字符串
  }
}


2. 积分相关接口
2.1 获取积分套餐列表

接口路径: /api/v1/points/packages
请求方式: GET
请求头: 需要携带token
响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "packages": [
      {
        "id": "string", // 套餐ID
        "name": "string", // 套餐名称
        "points": 0, // 包含积分数量
        "price": 0, // 价格（分）
        "originalPrice": 0, // 原价（分）
        "discount": 0, // 折扣百分比
        "isHot": false, // 是否热销
        "description": "string" // 套餐描述
      }
    ]
  }
}


2.2 创建积分购买订单

接口路径: /api/v1/points/create-order
请求方式: POST
请求头: 需要携带token
请求参数:
jsonCopy{
  "packageId": "string" // 套餐ID
}

响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "string", // 订单ID
    "paymentInfo": {
      "timeStamp": "string", // 时间戳，微信支付用
      "nonceStr": "string", // 随机字符串，微信支付用
      "package": "string", // 预支付交易会话标识，微信支付用
      "signType": "string", // 签名方式，微信支付用
      "paySign": "string" // 签名，微信支付用
    },
    "orderInfo": {
      "packageName": "string", // 套餐名称
      "points": 0, // 积分数量
      "price": 0, // 价格（分）
      "createTime": "string" // 创建时间，ISO格式日期字符串
    }
  }
}

特殊说明:

前端需调用 wx.requestPayment() 并传入返回的paymentInfo进行支付
微信支付成功后会通过后端配置的回调URL通知服务端



2.3 查询订单支付状态

接口路径: /api/v1/points/check-payment
请求方式: GET
请求头: 需要携带token
请求参数:
CopyorderId=string // 订单ID

响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "isPaid": false, // 是否已支付
    "points": 0, // 支付后的总积分（如果已支付）
    "expiryDate": "string" // 积分有效期（如果已支付），ISO格式日期字符串
  }
}


2.4 获取积分购买记录

接口路径: /api/v1/points/purchase-history
请求方式: GET
请求头: 需要携带token
请求参数:
Copypage=1&size=10 // 分页参数，默认第1页，每页10条

响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "total": 0, // 总记录数
    "list": [
      {
        "orderId": "string", // 订单ID
        "packageName": "string", // 套餐名称
        "points": 0, // 购买的积分数量
        "price": 0, // 支付价格（分）
        "status": "string", // 状态：pending、paid、failed
        "purchaseTime": "string" // 购买时间，ISO格式日期字符串
      }
    ]
  }
}


2.5 获取积分消费记录

接口路径: /api/v1/points/consumption-history
请求方式: GET
请求头: 需要携带token
请求参数:
Copypage=1&size=10 // 分页参数，默认第1页，每页10条

响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "total": 0, // 总记录数
    "list": [
      {
        "id": "string", // 消费记录ID
        "title": "string", // 消费项目名称
        "description": "string", // 消费描述，可选
        "points": 0, // 消费的积分数量
        "consumeTime": "string", // 消费时间，ISO格式日期字符串
        "apiKeyId": "string", // 关联的API Key ID，可选
        "apiKeyName": "string" // 关联的API Key名称，可选
      }
    ]
  }
}


3. API Key相关接口
3.1 获取API Key列表

接口路径: /api/v1/api-keys
请求方式: GET
请求头: 需要携带token
响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "string", // API Key ID
        "name": "string", // API Key名称
        "status": "string", // 状态：active或inactive
        "createdAt": "string", // 创建时间，ISO格式日期字符串
        "expiresAt": "string", // 过期时间，ISO格式日期字符串
        "lastUsedAt": "string" // 最后使用时间，ISO格式日期字符串，可能为null
      }
    ]
  }
}


3.2 创建API Key

接口路径: /api/v1/api-keys/create
请求方式: POST
请求头: 需要携带token
请求参数:
jsonCopy{
  "name": "string", // API Key名称
  "expiryMonths": 6 // 过期时间（月），可选值：1, 3, 6, 12，默认6
}

响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string", // API Key ID
    "name": "string", // API Key名称
    "status": "active", // 状态
    "createdAt": "string", // 创建时间，ISO格式日期字符串
    "expiresAt": "string", // 过期时间，ISO格式日期字符串
    "key": "string" // API Key值，仅在创建时返回一次
  }
}


3.3 删除API Key

接口路径: /api/v1/api-keys/delete
请求方式: POST
请求头: 需要携带token
请求参数:
jsonCopy{
  "id": "string" // API Key ID
}

响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": null
}


3.4 更新API Key状态

接口路径: /api/v1/api-keys/update-status
请求方式: POST
请求头: 需要携带token
请求参数:
jsonCopy{
  "id": "string", // API Key ID
  "status": "string" // 新状态：active或inactive
}

响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": null
}


4. 系统相关接口
4.1 获取系统状态

接口路径: /api/v1/system/status
请求方式: GET
响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "apiStatus": "normal", // API服务状态：normal或error
    "message": "string", // 状态描述
    "maintenance": false, // 是否在维护中
    "maintenanceEndTime": "string" // 维护预计结束时间，ISO格式日期字符串，可能为null
  }
}


4.2 获取系统公告

接口路径: /api/v1/system/notice
请求方式: GET
响应数据:
jsonCopy{
  "code": 0,
  "message": "success",
  "data": {
    "hasNotice": true, // 是否有公告
    "content": "string", // 公告内容
    "startTime": "string", // 公告开始时间，ISO格式日期字符串
    "endTime": "string" // 公告结束时间，ISO格式日期字符串
  }
}


微信能力调用说明
在小程序中调用微信官方能力时，需要注意以下几点：
登录流程

调用 wx.login() 获取临时code
将code发送到服务端换取自身登录态token
存储token并在后续请求中携带

用户信息获取

通过 wx.getUserProfile() 获取加密的用户信息
将加密数据发送到服务端解密并存储

支付流程

通过创建订单接口获取微信支付所需参数
调用 wx.requestPayment() 发起支付
支付完成后查询订单状态或等待支付结果通知

其他注意事项

小程序必须在微信公众平台配置服务器域名，否则无法请求API
微信支付需要在商户平台进行相关配置
用户敏感信息必须通过服务端解密，不能在前端处理

经过检查，该文档已经涵盖了小程序API积分商城所需的所有接口，并且考虑了与微信小程序官方能力的结合使用。接口规范符合RESTful风格，错误处理和状态码定义清晰，适合提交给后端研发工程师进行开发。