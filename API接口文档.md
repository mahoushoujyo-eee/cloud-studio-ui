# CloudStudio API接口文档

## 概述

CloudStudio云端开发环境管理平台的API接口文档，包含用户认证和工作空间管理的完整接口规范。

## 基础信息

- **Base URL**: `http://localhost:8080`
- **认证方式**: Bearer Token
- **数据格式**: JSON

## 用户认证接口

### 1. 用户登录

**接口地址**: `POST /api/auth/login`

**请求参数**:
```json
{
  "email": "admin@cloudstudio.com",
  "password": "123456"
}
```

**响应数据**:
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@cloudstudio.com",
    "phone": "13800138000",
    "avatar": "",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. 用户注册

**接口地址**: `POST /api/auth/register`

**请求参数**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "123456"
}
```

**响应数据**:
```json
{
  "message": "注册成功"
}
```

### 3. 重置密码

**接口地址**: `POST /api/auth/reset-password`

**请求参数**:
```json
{
  "email": "user@example.com"
}
```

**响应数据**:
```json
{
  "message": "重置密码邮件已发送"
}
```

## 工作空间管理接口

### 1. 获取工作空间列表

**接口地址**: `GET /api/workspaces`

**请求头**:
```
Authorization: Bearer <token>
```

**响应数据**:
```json
[
  {
    "id": 1,
    "name": "IoC",
    "description": "暂无描述",
    "status": "stopped",
    "tags": ["Java", "Go", "Python"],
    "createdAt": "2025-08-02T00:00:00Z",
    "lastUsed": "2025-08-04T00:00:00Z",
    "spec": "高级版 4C8G",
    "environment": "All in One",
    "version": "full 1.0.0",
    "source": "import",
    "provider": "coding"
  }
]
```

### 2. 创建工作空间

**接口地址**: `POST /api/workspaces`

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "name": "新工作空间",
  "description": "工作空间描述",
  "source": "import",
  "provider": "coding",
  "environment": "all-in-one",
  "version": "1.0.0",
  "spec": "free"
}
```

**响应数据**:
```json
{
  "id": 5,
  "name": "新工作空间",
  "description": "工作空间描述",
  "status": "stopped",
  "tags": ["Java", "Go", "Python"],
  "createdAt": "2025-08-19T02:00:00Z",
  "lastUsed": "2025-08-19T02:00:00Z",
  "spec": "免费版 1核2GB内存",
  "environment": "All in One",
  "version": "full 1.0.0",
  "source": "import",
  "provider": "coding"
}
```

### 3. 获取工作空间详情

**接口地址**: `GET /api/workspaces/{id}`

**请求头**:
```
Authorization: Bearer <token>
```

**响应数据**:
```json
{
  "id": 1,
  "name": "IoC",
  "description": "暂无描述",
  "status": "stopped",
  "tags": ["Java", "Go", "Python"],
  "createdAt": "2025-08-02T00:00:00Z",
  "lastUsed": "2025-08-04T00:00:00Z",
  "spec": "高级版 4C8G",
  "environment": "All in One",
  "version": "full 1.0.0",
  "source": "import",
  "provider": "coding",
  "stats": {
    "cpu": 25,
    "memory": 60,
    "storage": 45
  },
  "logs": [
    {
      "id": 1,
      "timestamp": "2025-08-04T10:30:00Z",
      "action": "工作空间已停止",
      "status": "success"
    }
  ]
}
```

### 4. 启动工作空间

**接口地址**: `POST /api/workspaces/{id}/start`

**请求头**:
```
Authorization: Bearer <token>
```

**响应数据**:
```json
{
  "id": 1,
  "status": "running",
  "lastUsed": "2025-08-19T02:00:00Z"
}
```

### 5. 停止工作空间

**接口地址**: `POST /api/workspaces/{id}/stop`

**请求头**:
```
Authorization: Bearer <token>
```

**响应数据**:
```json
{
  "id": 1,
  "status": "stopped"
}
```

### 6. 删除工作空间

**接口地址**: `DELETE /api/workspaces/{id}`

**请求头**:
```
Authorization: Bearer <token>
```

**响应数据**:
```json
{
  "message": "删除成功"
}
```

### 7. 获取工作空间访问URL

**接口地址**: `GET /api/workspaces/{id}/url`

**请求头**:
```
Authorization: Bearer <token>
```

**响应数据**:
```json
{
  "url": "https://code-server-1.cloudstudio.com"
}
```

## 错误响应格式

所有接口在出错时都会返回统一的错误格式：

```json
{
  "message": "错误描述信息"
}
```

常见HTTP状态码：
- `200` - 请求成功
- `400` - 请求参数错误
- `401` - 未授权或token过期
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误

## 测试账号

为了方便测试，系统提供了以下测试账号：

- **邮箱**: `admin@cloudstudio.com`
- **密码**: `123456`

## 模拟数据说明

当前前端项目已集成模拟API，可以在没有后端服务的情况下正常运行和测试所有功能。模拟数据包括：

1. **用户数据**: 包含管理员账号信息
2. **工作空间数据**: 包含4个示例工作空间，涵盖不同状态和配置
3. **API拦截**: 自动拦截所有API请求并返回模拟数据

## 后端实现建议

1. **数据库设计**:
   - `users` 表：用户信息
   - `workspaces` 表：工作空间信息
   - `workspace_logs` 表：操作日志

2. **技术栈建议**:
   - Node.js + Express 或 Go + Gin
   - MySQL 或 PostgreSQL
   - Redis（缓存和会话）
   - Docker（容器管理）

3. **安全考虑**:
   - JWT Token认证
   - 密码加密存储
   - API访问频率限制
   - 输入参数验证

4. **容器管理**:
   - 集成Docker API
   - 实现Pod生命周期管理
   - 资源监控和限制
   - 网络和存储管理