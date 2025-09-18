# VRoid Hub OAuth 设置指南

## 概述

VRoid Hub API 需要 OAuth 2.0 认证才能访问。本指南将帮助您设置 OAuth 认证以获取真实的 VRoid Hub 数据。

## 步骤 1: 注册开发者账户

1. 访问 [VRoid Hub 开发者注册页面](https://hub.vroid.com/en/developer/registration)
2. 使用您的 VRoid Hub 账户登录
3. 完成开发者注册流程

## 步骤 2: 创建应用程序

1. 登录开发者控制台
2. 创建新的应用程序
3. 获取以下信息：
   - `client_id` (客户端ID)
   - `client_secret` (客户端密钥)
   - 设置回调URL: `http://localhost:3000/oauth/callback`

## 步骤 3: 申请公认应用（可选但推荐）

1. 访问 [公认应用申请页面](https://developer.vroid.com/api/recognize.html)
2. 填写申请信息
3. 等待审核（通常需要一周时间）

**公认应用的优势：**
- 无用户警告提示
- 更高的API请求限制
- 访问更多公开模型

## 步骤 4: 配置 OAuth 参数

在 `rpg_asset_manager_ui.html` 中更新 VRoidConfig：

```javascript
const VRoidConfig = {
    clientId: 'your_actual_client_id', // 替换为您的客户端ID
    clientSecret: 'your_actual_client_secret', // 替换为您的客户端密钥
    redirectUri: 'http://localhost:3000/oauth/callback', // 您的回调URL
    apiVersion: '11'
};
```

## 步骤 5: OAuth 认证流程

### 授权URL
```
https://hub.vroid.com/oauth/authorize?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope=default
```

### 获取访问令牌
```javascript
POST https://hub.vroid.com/oauth/token
Headers:
  X-Api-Version: 11
  Content-Type: application/x-www-form-urlencoded

Body:
  client_id={client_id}
  client_secret={client_secret}
  redirect_uri={redirect_uri}
  grant_type=authorization_code
  code={authorization_code}
```

### 使用访问令牌
```javascript
GET https://hub.vroid.com/api/search/character_models?keyword=character&count=5
Headers:
  X-Api-Version: 11
  Authorization: Bearer {access_token}
```

## API 端点

### 角色搜索
- **端点**: `GET /api/search/character_models`
- **参数**: 
  - `keyword`: 搜索关键词
  - `count`: 结果数量 (1-100)
  - `is_downloadable`: 是否可下载 (true/false)

### 角色详情
- **端点**: `GET /api/character_models/{id}`
- **参数**: 角色ID

### 用户收藏
- **端点**: `GET /api/hearts`
- **参数**: 各种过滤条件

## 数据格式

### 角色模型数据结构
```typescript
type CharacterModelSerializer = {
  id: string;
  name: string;
  is_downloadable: boolean;
  portrait_image: {
    sq300: { url: string };
    original: { url: string };
  };
  character: {
    user: {
      name: string;
    };
  };
  tags: Array<{ name: string }>;
  download_count: number;
  latest_character_model_version: {
    original_file_size: number;
    triangle_count: number;
  };
  // ... 更多字段
}
```

## 当前实现状态

✅ **已完成**:
- OAuth 认证流程框架
- 正确的 API 端点配置
- 数据解析和显示逻辑
- 模拟数据后备方案

⚠️ **需要配置**:
- 实际的 client_id 和 client_secret
- OAuth 回调处理
- 访问令牌存储和刷新

## 测试

1. 配置正确的 OAuth 参数
2. 启动应用程序
3. 搜索 "character" 关键词
4. 检查控制台日志确认 API 调用状态

## 故障排除

### 常见错误
- **400 错误**: 检查请求参数和 OAuth 配置
- **401 错误**: 访问令牌无效或过期
- **403 错误**: 权限不足，可能需要公认应用

### 调试步骤
1. 检查控制台日志
2. 验证 OAuth 参数
3. 确认 API 版本号 (11)
4. 检查网络连接

## 相关链接

- [VRoid Hub API 文档](https://developer.vroid.com/api/)
- [OAuth API 参考](https://developer.vroid.com/api/oauth-api.html)
- [角色模型 API](https://developer.vroid.com/api/list-character.html)
- [开发者注册](https://hub.vroid.com/en/developer/registration)
