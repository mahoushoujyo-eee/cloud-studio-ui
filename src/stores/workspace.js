import { defineStore } from 'pinia'
import { 
  getWorkspaceList, 
  createWorkspace, 
  deleteWorkspace, 
  getWorkspaceDetails,
  updateWorkspace 
} from '@/api/workspace'

export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    workspaces: [],
    currentWorkspace: null,
    loading: false,
    total: 0
  }),

  getters: {
    getWorkspaceById: (state) => (id) => {
      return state.workspaces.find(workspace => workspace.id === id)
    },
    runningWorkspaces: (state) => {
      return state.workspaces.filter(workspace => workspace.status === 'Running')
    },
    stoppedWorkspaces: (state) => {
      return state.workspaces.filter(workspace => workspace.status === 'Stopped')
    }
  },

  actions: {
    // 获取工作空间列表
    async fetchWorkspaces(params = {}) {
      this.loading = true
      try {
        const response = await getWorkspaceList(params)
        
        if (response.data.statuscode === 200) {
          this.workspaces = response.data.data || []
          this.total = this.workspaces.length
          return { success: true, data: this.workspaces }
        } else {
          return { success: false, message: response.data.message || '获取工作空间列表失败' }
        }
      } catch (error) {
        console.error('Fetch workspaces error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      } finally {
        this.loading = false
      }
    },

    // 创建工作空间
    async createWorkspace(workspaceData) {
      try {
        const response = await createWorkspace(workspaceData)
        
        if (response.data.statuscode === 200) {
          // 创建成功后刷新列表
          await this.fetchWorkspaces()
          return { success: true, message: '工作空间创建成功', data: response.data.data }
        } else {
          return { success: false, message: response.data.message || '创建工作空间失败' }
        }
      } catch (error) {
        console.error('Create workspace error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    // 删除工作空间
    async deleteWorkspace(workspaceData) {
      try {
        const response = await deleteWorkspace(workspaceData)
        
        if (response.data.statuscode === 200) {
          // 删除成功后从本地列表中移除
          this.workspaces = this.workspaces.filter(ws => ws.name !== workspaceData.name)
          return { success: true, message: '工作空间删除成功' }
        } else {
          return { success: false, message: response.data.message || '删除工作空间失败' }
        }
      } catch (error) {
        console.error('Delete workspace error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    // 获取工作空间详情
    async getWorkspaceDetails(workspaceData) {
      try {
        const response = await getWorkspaceDetails(workspaceData)
        
        if (response.data.statuscode === 200) {
          return { success: true, data: response.data.data }
        } else {
          return { success: false, message: response.data.message || '获取工作空间详情失败' }
        }
      } catch (error) {
        console.error('Get workspace details error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    // 更新工作空间
    async updateWorkspace(workspaceData) {
      try {
        const response = await updateWorkspace(workspaceData)
        
        if (response.data.statuscode === 200) {
          // 更新成功后刷新列表
          await this.fetchWorkspaces()
          return { success: true, message: '工作空间更新成功' }
        } else {
          return { success: false, message: response.data.message || '更新工作空间失败' }
        }
      } catch (error) {
        console.error('Update workspace error:', error)
        return { success: false, message: '网络错误，请稍后重试' }
      }
    },

    // 设置当前工作空间
    setCurrentWorkspace(workspace) {
      this.currentWorkspace = workspace
    },

    // 清空工作空间数据
    clearWorkspaces() {
      this.workspaces = []
      this.currentWorkspace = null
      this.total = 0
    }
  }
})