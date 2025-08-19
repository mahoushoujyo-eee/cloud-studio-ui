// 模拟数据，用于开发测试
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    email: 'admin@example.com',
    password: '123456',
    avatar: '/placeholder.svg?height=40&width=40',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'user1',
    nickname: '用户1',
    email: 'user1@example.com',
    password: '123456',
    avatar: '/placeholder.svg?height=40&width=40',
    created_at: '2024-01-01T00:00:00Z'
  }
]

// 模拟工作空间数据，匹配后端AppParam结构
export const mockWorkspaces = [
  {
    name: 'my-workspace-1',
    namespace: 'default',
    image: 'node:18-alpine',
    cpu: '1000m',
    memory: '2Gi',
    storage: '10Gi',
    port: 8080,
    status: 'Running',
    phase: 'Running',
    created_at: '2024-01-15T10:30:00Z',
    url: 'https://my-workspace-1.cloudstudio.dev',
    description: 'Node.js开发环境'
  },
  {
    name: 'python-project',
    namespace: 'default',
    image: 'python:3.9-slim',
    cpu: '500m',
    memory: '1Gi',
    storage: '5Gi',
    port: 8000,
    status: 'Stopped',
    phase: 'Succeeded',
    created_at: '2024-01-10T14:20:00Z',
    url: '',
    description: 'Python开发环境'
  },
  {
    name: 'react-app',
    namespace: 'default',
    image: 'node:16-alpine',
    cpu: '2000m',
    memory: '4Gi',
    storage: '20Gi',
    port: 3000,
    status: 'Running',
    phase: 'Running',
    created_at: '2024-01-12T09:15:00Z',
    url: 'https://react-app.cloudstudio.dev',
    description: 'React前端开发环境'
  }
]

// 模拟镜像列表
export const mockImages = [
  {
    name: 'node:18-alpine',
    description: 'Node.js 18 Alpine Linux',
    category: 'Frontend'
  },
  {
    name: 'node:16-alpine',
    description: 'Node.js 16 Alpine Linux',
    category: 'Frontend'
  },
  {
    name: 'python:3.9-slim',
    description: 'Python 3.9 Slim',
    category: 'Backend'
  },
  {
    name: 'python:3.11-slim',
    description: 'Python 3.11 Slim',
    category: 'Backend'
  },
  {
    name: 'openjdk:11-jre-slim',
    description: 'OpenJDK 11 JRE Slim',
    category: 'Backend'
  },
  {
    name: 'golang:1.19-alpine',
    description: 'Go 1.19 Alpine Linux',
    category: 'Backend'
  },
  {
    name: 'ubuntu:22.04',
    description: 'Ubuntu 22.04 LTS',
    category: 'System'
  }
]

// 模拟API响应
export const mockApiResponse = (data, message = 'success') => {
  return {
    data: {
      statuscode: 200,
      message,
      data
    }
  }
}

// 模拟错误响应
export const mockErrorResponse = (message = 'error', statuscode = 500) => {
  return {
    data: {
      statuscode,
      message,
      data: null
    }
  }
}

// 默认导出
export default function setupMockData() {
  console.log('Mock data initialized')
}