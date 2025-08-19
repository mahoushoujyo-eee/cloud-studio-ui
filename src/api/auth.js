import request from '@/utils/request'

// 用户登录
export const login = (data) => {
  return request({
    url: '/api/public/login',
    method: 'post',
    data
  })
}

// 用户注册
export const register = (data) => {
  return request({
    url: '/api/public/register',
    method: 'post',
    data
  })
}

// 发送注册验证码
export const sendRegisterCode = (data) => {
  return request({
    url: '/api/public/reset/email',
    method: 'post',
    data: {
      receiver: data.email,
      type: 'register'
    }
  })
}

// 发送重置密码验证码
export const sendResetCode = (data) => {
  return request({
    url: '/api/public/reset/email',
    method: 'post',
    data: {
      receiver: data.email,
      type: 'reset'
    }
  })
}

// 重置密码
export const resetPassword = (data) => {
  return request({
    url: '/api/public/reset/password',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/api/common/hello',
    method: 'get'
  })
}

// 更新用户信息
export const updateUserInfo = (data) => {
  return request({
    url: '/api/common/user',
    method: 'put',
    data
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/api/common/change-password',
    method: 'post',
    data
  })
}