import request from '@/utils/request'

// 获取工作空间列表
export const getWorkspaceList = (data) => {
  return request({
    url: '/api/common/list',
    method: 'get',
    data
  })
}

// 创建工作空间
export const createWorkspace = (data) => {
  return request({
    url: '/api/common/create',
    method: 'post',
    data
  })
}

// 删除工作空间
export const deleteWorkspace = (data) => {
  return request({
    url: '/api/common/delete',
    method: 'post',
    data
  })
}

// 获取工作空间详情/状态
export const getWorkspaceDetails = (data) => {
  return request({
    url: '/api/common/details',
    method: 'post',
    data
  })
}

// 更新工作空间配置
export const updateWorkspace = (data) => {
  return request({
    url: '/api/common/update',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserHello = () => {
  return request({
    url: '/api/common/hello',
    method: 'get'
  })
}