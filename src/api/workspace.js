import request from '@/utils/request'

const prefix = '/api/app'


// 获取工作空间列表
export const getWorkspaceList = (data) => {
  return request({
    url: prefix + '/common/list',
    method: 'get',
    data
  })
}

// 创建工作空间
export const createWorkspace = (data) => {
  return request({
    url: prefix + '/common/create',
    method: 'post',
    data
  })
}

// 删除工作空间
export const deleteWorkspace = (data) => {
  return request({
    url: prefix + '/common/delete',
    method: 'post',
    data
  })
}

// 获取工作空间详情/状态
export const getWorkspaceDetails = (data) => {
  return request({
    url: prefix + '/common/details',
    method: 'post',
    data
  })
}

// 更新工作空间配置
export const updateWorkspace = (data) => {
  return request({
    url: prefix + '/common/update',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserHello = () => {
  return request({
    url: prefix + '/common/hello',
    method: 'get'
  })
}

// 停止工作空间
export const stopWorkspace = (data) => {
  return request({
    url: prefix + '/common/stop',
    method: 'post',
    data
  })
}

// 启动/重启工作空间
export const startWorkspace = (data) => {
  return request({
    url: prefix + '/common/restart',
    method: 'post',
    data
  })
}

// 获取工作空间日志
export const getWorkspaceLog = (data) => {
  return request({
    url: prefix + '/common/log',
    method: 'post',
    data
  })
}

export const getWorkspaceUsage = (data) => {
  return request({
    url: prefix + '/common/usage',
    method: 'post',
    data
  })
}