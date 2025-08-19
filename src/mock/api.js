import { mockUsers, mockWorkspaces, mockApiResponse, mockErrorResponse } from './index.js'

// 模拟API延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟登录API
export const mockLogin = async (credentials) => {
  await delay()
  
  const user = mockUsers.find(u => 
    (u.username === credentials.username || u.email === credentials.username) && 
    u.password === credentials.password
  )
  
  if (user) {
    const token = 'mock-jwt-token-' + Date.now()
    return mockApiResponse({
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar
      }
    }, '登录成功')
  } else {
    return mockErrorResponse('用户名或密码错误', 401)
  }
}

// 模拟注册API
export const mockRegister = async (userData) => {
  await delay()
  
  // 检查用户名是否已存在
  const existingUser = mockUsers.find(u => 
    u.username === userData.username || u.email === userData.email
  )
  
  if (existingUser) {
    return mockErrorResponse('用户名或邮箱已存在', 400)
  }
  
  return mockApiResponse(null, '注册成功')
}

// 模拟发送验证码API
export const mockSendCode = async (data) => {
  await delay()
  console.log('发送验证码到:', data.receiver)
  return mockApiResponse(null, '验证码已发送')
}

// 模拟重置密码API
export const mockResetPassword = async (data) => {
  await delay()
  return mockApiResponse(null, '密码重置成功')
}

// 模拟获取用户信息API
export const mockGetUserInfo = async () => {
  await delay()
  return mockApiResponse(mockUsers[0], '获取成功')
}

// 模拟获取工作空间列表API
export const mockGetWorkspaces = async () => {
  await delay()
  return mockApiResponse(mockWorkspaces, '查询成功')
}

// 模拟创建工作空间API
export const mockCreateWorkspace = async (data) => {
  await delay()
  const newWorkspace = {
    ...data,
    status: 'Creating',
    phase: 'Pending',
    created_at: new Date().toISOString(),
    url: ''
  }
  mockWorkspaces.push(newWorkspace)
  return mockApiResponse(data.name, '创建成功')
}

// 模拟删除工作空间API
export const mockDeleteWorkspace = async (data) => {
  await delay()
  const index = mockWorkspaces.findIndex(ws => ws.name === data.name)
  if (index > -1) {
    mockWorkspaces.splice(index, 1)
    return mockApiResponse(null, '删除成功')
  }
  return mockErrorResponse('工作空间不存在', 404)
}

// 模拟获取工作空间详情API
export const mockGetWorkspaceDetails = async (data) => {
  await delay()
  const workspace = mockWorkspaces.find(ws => ws.name === data.name)
  if (workspace) {
    return mockApiResponse({
      phase: workspace.phase,
      conditions: []
    }, '获取成功')
  }
  return mockErrorResponse('工作空间不存在', 404)
}

export default function setupMockAPI() {
  console.log('Mock API initialized')
}