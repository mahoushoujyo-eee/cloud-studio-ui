import { defineStore } from 'pinia'
import { login, register, resetPassword, getUserInfo } from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false
  }),

  getters: {
    userInfo: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && !!state.token
  },

  actions: {
    // 登录
    async login(credentials) {
      try {
        const response = await login(credentials)
        
        if (response.data.statuscode === 200) {
          const token = response.data.data
          const tokenWithBearer = `Bearer ${token}`
          
          this.token = tokenWithBearer
          this.isAuthenticated = true
          
          localStorage.setItem('token', tokenWithBearer)
          
          // 登录成功后获取用户信息
          await this.fetchUserInfo()
          
          return { success: true, message: response.data.message || '登录成功' }
        } else {
          return { success: false, message: response.data.message || '登录失败' }
        }
      } catch (error) {
        console.error('Login error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    // 注册
    async register(userData) {
      try {
        const response = await register(userData)
        
        if (response.data.statuscode === 200) {
          return { success: true, message: '注册成功' }
        } else {
          return { success: false, message: response.data.message || '注册失败' }
        }
      } catch (error) {
        console.error('Register error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    // 重置密码
    async resetPassword(email) {
      try {
        const response = await resetPassword({ receiver: email })
        
        if (response.data.statuscode === 200) {
          return { success: true, message: '密码重置邮件已发送' }
        } else {
          return { success: false, message: response.data.message || '重置失败' }
        }
      } catch (error) {
        console.error('Reset password error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const response = await getUserInfo()
        
        if (response.data.statuscode === 200) {
          this.user = response.data.data
          this.isAuthenticated = true
          // 保存用户信息到本地存储
          localStorage.setItem('user', JSON.stringify(response.data.data))
          return { success: true, data: response.data.data }
        } else {
          // 如果获取用户信息失败，清除无效的token
          this.logout()
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('Fetch user info error:', error)
        // 网络错误或token无效时，清除登录状态
        this.logout()
        return { success: false, message: '获取用户信息失败' }
      }
    },

    // 登出
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    // 初始化认证状态
    async initUser() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && token !== 'null' && token !== 'undefined') {
        this.token = token
        
        // 如果有保存的用户信息，先恢复
        if (user && user !== 'null' && user !== 'undefined') {
          try {
            this.user = JSON.parse(user)
            this.isAuthenticated = true
          } catch (error) {
            console.error('解析用户信息失败:', error)
            localStorage.removeItem('user')
          }
        }
        
        // 验证token有效性并获取最新用户信息
        try {
          const result = await this.fetchUserInfo()
          if (!result.success) {
            console.log('Token已失效，需要重新登录')
          }
        } catch (error) {
          console.error('验证token失败:', error)
          this.logout()
        }
      } else {
        // 没有token，清除所有认证状态
        this.logout()
      }
    }
  }
})