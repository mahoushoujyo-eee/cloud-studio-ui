import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { 
  mockLogin, 
  mockRegister, 
  mockSendCode, 
  mockResetPassword, 
  mockGetUserInfo,
  mockGetWorkspaces,
  mockCreateWorkspace,
  mockDeleteWorkspace,
  mockGetWorkspaceDetails,
  mockStopWorkspace,
  mockStartWorkspace,
  mockGetWorkspaceLog
} from '@/mock/api.js'

// 创建axios实例
const request = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 模拟API路由映射
const mockRoutes = {
  'POST:/api/public/login': mockLogin,
  'POST:/api/public/register': mockRegister,
  'POST:/api/public/reset/email': mockSendCode,
  'POST:/api/public/reset/password': mockResetPassword,
  'GET:/api/common/hello': mockGetUserInfo,
  'GET:/api/common/list': mockGetWorkspaces,
  'POST:/api/common/create': mockCreateWorkspace,
  'POST:/api/common/delete': mockDeleteWorkspace,
  'POST:/api/common/details': mockGetWorkspaceDetails,
  'POST:/api/user/common/stop': mockStopWorkspace,
  'POST:/api/user/common/restart': mockStartWorkspace,
  'POST:/api/user/common/log': mockGetWorkspaceLog
}

// 请求拦截器
request.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    
    // 添加token到请求头
    if (authStore.token) {
      config.headers.Authorization = authStore.token
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 拦截请求并使用模拟数据
request.interceptors.response.use(
  response => response,
  async error => {
    // 如果是网络错误，使用模拟API
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      const { method, url, data } = error.config
      const routeKey = `${method.toUpperCase()}:${url}`
      const mockHandler = mockRoutes[routeKey]
      
      if (mockHandler) {
        try {
          const mockResponse = await mockHandler(data)
          return Promise.resolve(mockResponse)
        } catch (mockError) {
          console.error('Mock API error:', mockError)
        }
      }
    }
    
    // 处理HTTP错误状态码
    if (error.response) {
      const { status } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          const authStore = useAuthStore()
          authStore.logout()
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error('请求失败，请稍后重试')
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络')
    }
    
    return Promise.reject(error)
  }
)

export default request