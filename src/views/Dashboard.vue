<template>
  <div class="dashboard">
    <!-- 顶部导航栏 -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="logo">
          <el-icon><Monitor /></el-icon>
          Cloud Studio
        </h1>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleUserCommand">
          <span class="user-dropdown">
            <el-avatar :size="32" :src="user?.avatar">
              {{ user?.username?.charAt(0)?.toUpperCase() }}
            </el-avatar>
            <span class="username">{{ user?.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="dashboard-main">
      <!-- 侧边栏 -->
      <aside class="dashboard-sidebar">
        <nav class="sidebar-nav">
          <div class="nav-item active">
            <el-icon><Monitor /></el-icon>
            <span>通用工作空间</span>
          </div>
          <div class="nav-item">
            <el-icon><Cpu /></el-icon>
            <span>高性能工作空间</span>
          </div>
          <div class="nav-item">
            <el-icon><Grid /></el-icon>
            <span>空间模板</span>
          </div>
        </nav>
      </aside>

      <!-- 内容区域 -->
      <div class="dashboard-content">
        <!-- 工作空间统计 -->
        <div class="workspace-stats">
          <div class="stats-card">
            <div class="stats-info">
              <h3>通用工作空间</h3>
              <div class="usage-bar">
                <div class="usage-progress" :style="{ width: usagePercentage + '%' }"></div>
              </div>
              <p class="usage-text">已用 {{ usedMinutes }} 分钟 / 共计 {{ totalMinutes }} 分钟</p>
            </div>
            <div class="stats-actions">
              <el-button 
                size="small" 
                :loading="loading" 
                @click="refreshWorkspaces"
                style="margin-right: 12px;"
              >
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button type="primary" @click="showCreateDialog = true">新建</el-button>
            </div>
          </div>
        </div>

        <!-- 工作空间列表 -->
        <div class="workspace-container" v-loading="loading">
          <!-- 空状态提示 -->
          <div v-if="!loading && workspaces.length === 0" class="empty-state">
            <div class="empty-icon">
              <el-icon size="64"><Monitor /></el-icon>
            </div>
            <h3 class="empty-title">暂无工作空间</h3>
            <p class="empty-description">创建您的第一个工作空间，开始云端开发之旅</p>
            <el-button 
              type="primary" 
              size="large" 
              @click="showCreateDialog = true"
              class="create-workspace-btn"
            >
              <el-icon><Plus /></el-icon>
              即刻创建容器体验云端开发
            </el-button>
          </div>
          
          <!-- 工作空间列表 -->
          <div
            v-for="workspace in workspaces"
            :key="workspace.id"
            class="workspace-item"
          >
            <div class="workspace-left">
              <el-icon class="workspace-icon"><Document /></el-icon>
              <div class="workspace-info">
                <div class="workspace-name">{{ workspace.name }}</div>
                <div class="workspace-resources">{{ formatResourceConfig(workspace.cpu, workspace.memory) }}</div>
              </div>
            </div>
            
            <div class="workspace-tags">
              <el-tag size="small" class="language-tag">Java</el-tag>
              <el-tag size="small" class="language-tag">Go</el-tag>
              <el-tag size="small" class="language-tag">Python</el-tag>
            </div>
            
            <div class="workspace-time">
              <div class="time-item">
                <span class="time-label">创建时间</span>
                <span class="time-value">{{ formatDate(workspace.CreatedAt) }}</span>
              </div>
              <div class="time-item">
                <span class="time-label">最近使用</span>
                <span class="time-value">{{ formatDate(workspace.UpdatedAt) }}</span>
              </div>
            </div>
            
            <div class="workspace-status">
              <el-tag
                :type="getStatusType(workspace.state)"
                size="small"
              >
                {{ getStatusText(workspace.state) }}
              </el-tag>
            </div>
            
            <div class="workspace-actions">
              <el-button
                v-if="workspace.state === 'running' && workspace.url"
                type="success"
                size="small"
                @click="openWorkspace(workspace)"
              >
                <el-icon><Link /></el-icon>
                打开
              </el-button>
              <el-button
                v-else-if="workspace.state === 'stopped'"
                type="primary"
                size="small"
                :loading="workspace.starting"
                @click="startWorkspace(workspace)"
              >
                <el-icon><VideoPlay /></el-icon>
                启动
              </el-button>
              <el-button
                v-else-if="workspace.state === 'initializing'"
                type="warning"
                size="small"
                disabled
              >
                <el-icon><Loading /></el-icon>
                初始化中
              </el-button>
              <el-button
                v-if="workspace.state === 'running'"
                type="warning"
                size="small"
                :loading="workspace.stopping"
                @click="stopWorkspace(workspace)"
              >
                <el-icon><VideoPause /></el-icon>
                停止
              </el-button>
              <el-dropdown @command="(cmd) => handleWorkspaceCommand(cmd, workspace)">
                <el-button size="small" type="info">
                  <el-icon><More /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="settings">设置</el-dropdown-item>
                    <el-dropdown-item command="clone">克隆</el-dropdown-item>
                    <el-dropdown-item divided command="delete" style="color: #f56c6c;">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 创建工作空间对话框 -->
    <CreateWorkspaceDialog
      v-model="showCreateDialog"
      @created="handleWorkspaceCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Monitor, ArrowDown, Cpu, Grid, Document, Link, Plus, Delete, Setting, Calendar, Clock, VideoPlay, VideoPause, Loading, More, Refresh } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import CreateWorkspaceDialog from '@/components/CreateWorkspaceDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()

const showCreateDialog = ref(false)
const sortBy = ref('recent')

const user = computed(() => authStore.user)
const workspaces = computed(() => workspaceStore.workspaces)
const loading = computed(() => workspaceStore.loading)

// 模拟使用统计
const usedMinutes = ref(14852)
const totalMinutes = ref(50000)
const usagePercentage = computed(() => (usedMinutes.value / totalMinutes.value) * 100)

onMounted(() => {
  // 检查用户是否已登录
  const token = localStorage.getItem('token')
  if (!token || token === 'undefined') {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 初始化用户状态
  authStore.initUser()
  
  // 如果用户状态未正确初始化，跳转到登录页
  if (!authStore.isAuthenticated) {
    ElMessage.warning('登录状态已过期，请重新登录')
    router.push('/login')
    return
  }
  
  workspaceStore.fetchWorkspaces()
})

const getStatusType = (state) => {
  const statusMap = {
    running: 'success',
    stopped: 'info',
    initializing: 'warning',
    error: 'danger'
  }
  return statusMap[state] || 'info'
}

const getStatusText = (state) => {
  const statusMap = {
    running: '运行中',
    stopped: '已停止',
    initializing: '初始化中',
    error: '错误'
  }
  return statusMap[state] || '未知'
}

const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化资源配置
const formatResourceConfig = (cpu, memory) => {
  if (!cpu && !memory) return '未知'
  
  let cpuText = ''
  let memoryText = ''
  
  // 处理CPU配置 (如: "2000m" -> "2C")
  if (cpu) {
    if (cpu.endsWith('m')) {
      const cpuValue = parseInt(cpu.replace('m', ''))
      cpuText = `${Math.ceil(cpuValue / 1000)}C`
    } else {
      cpuText = `${cpu}C`
    }
  }
  
  // 处理内存配置 (如: "4096Mi" -> "4G")
  if (memory) {
    if (memory.endsWith('Mi')) {
      const memoryValue = parseInt(memory.replace('Mi', ''))
      memoryText = `${Math.ceil(memoryValue / 1024)}G`
    } else if (memory.endsWith('Gi')) {
      const memoryValue = parseInt(memory.replace('Gi', ''))
      memoryText = `${memoryValue}G`
    } else {
      memoryText = memory
    }
  }
  
  return `${cpuText}${memoryText}`
}

const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}

const startWorkspace = async (workspace) => {
  workspace.starting = true
  try {
    const result = await workspaceStore.startWorkspace(workspace.id)
    if (result.success) {
      ElMessage.success('工作空间启动成功')
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    workspace.starting = false
  }
}

const stopWorkspace = async (workspace) => {
  workspace.stopping = true
  try {
    const result = await workspaceStore.stopWorkspace(workspace.id)
    if (result.success) {
      ElMessage.success('工作空间已停止')
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    workspace.stopping = false
  }
}

const openWorkspace = async (workspace) => {
  try {
    if (workspace.url) {
      // 清理URL中的多余空格和引号
      const cleanUrl = workspace.url.trim().replace(/["']/g, '')
      window.open(cleanUrl, '_blank')
    } else {
      ElMessage.error('工作空间访问地址不可用')
    }
  } catch (error) {
    ElMessage.error('打开工作空间失败')
  }
}

const handleWorkspaceCommand = async (command, workspace) => {
  switch (command) {
    case 'settings':
      router.push(`/workspace/${workspace.id}`)
      break
    case 'clone':
      ElMessage.info('克隆功能开发中')
      break
    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这个工作空间吗？', '确认删除', {
          type: 'warning'
        })
        const result = await workspaceStore.deleteWorkspace({ pod_name: workspace.pod_name })
        if (result.success) {
          ElMessage.success('工作空间已删除')
        } else {
          ElMessage.error(result.message)
        }
      } catch (error) {
        // 用户取消删除
      }
      break
  }
}

const handleWorkspaceCreated = async () => {
  try {
    await workspaceStore.fetchWorkspaces()
    ElMessage.success('列表已更新')
  } catch (error) {
    ElMessage.error('更新列表失败，请尝试手动刷新')
  }
}

const refreshWorkspaces = async () => {
  try {
    await workspaceStore.fetchWorkspaces()
    ElMessage.success('刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败，请稍后重试')
  }
}
</script>

<style scoped lang="scss">
.dashboard {
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
}

.dashboard-header {
  height: 60px;
  background: #2d3748;
  border-bottom: 1px solid #4a5568;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;

  .header-left {
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
      color: #409EFF;
      margin: 0;
    }
  }

  .header-right {
    .user-dropdown {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: background-color 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .username {
        font-size: 14px;
      }
    }
  }
}

.dashboard-main {
  display: flex;
  height: calc(100vh - 60px);
}

.dashboard-sidebar {
  width: 240px;
  background: #2d3748;
  border-right: 1px solid #4a5568;
  padding: 24px 0;

  .sidebar-nav {
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      &.active {
        background: rgba(64, 158, 255, 0.1);
        color: #409EFF;
        border-right: 3px solid #409EFF;
      }

      span {
        font-size: 14px;
      }
    }
  }
}

.dashboard-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.workspace-stats {
  margin-bottom: 32px;

  .stats-card {
    background: #2d3748;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .stats-info {
      flex: 1;

      h3 {
        font-size: 18px;
        margin: 0 0 16px 0;
      }

      .usage-bar {
        width: 300px;
        height: 6px;
        background: #4a5568;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;

        .usage-progress {
          height: 100%;
          background: linear-gradient(90deg, #f56565, #ed8936);
          transition: width 0.3s;
        }
      }

      .usage-text {
        font-size: 14px;
        color: #a0aec0;
        margin: 0;
      }
    }

    .stats-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
}

.workspace-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  
  .empty-icon {
    color: #4a5568;
    margin-bottom: 24px;
    opacity: 0.6;
  }
  
  .empty-title {
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 12px 0;
  }
  
  .empty-description {
    font-size: 14px;
    color: #a0aec0;
    margin: 0 0 32px 0;
    line-height: 1.5;
  }
  
  .create-workspace-btn {
    padding: 12px 24px;
    font-size: 16px;
    border-radius: 8px;
  }
}

.workspace-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(64, 158, 255, 0.05);
    border-color: #409EFF;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  }

  .workspace-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 0 0 200px;

    .workspace-icon {
      font-size: 20px;
      color: #409EFF;
    }

    .workspace-info {
      .workspace-name {
        font-size: 14px;
        font-weight: 500;
        color: #ffffff;
        margin-bottom: 4px;
      }

      .workspace-desc {
        font-size: 12px;
        color: #a0aec0;
        margin-bottom: 2px;
      }

      .workspace-resources {
        font-size: 12px;
        color: #68d391;
        font-weight: 500;
      }
    }
  }

  .workspace-tags {
    display: flex;
    gap: 6px;
    flex: 0 0 200px;
    
    .language-tag {
      background: rgba(64, 158, 255, 0.1);
      color: #409EFF;
      border: 1px solid rgba(64, 158, 255, 0.3);
    }
  }

  .workspace-time {
    flex: 0 0 200px;
    
    .time-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;
      
      .time-label {
        color: #a0aec0;
      }
      
      .time-value {
        color: #ffffff;
      }
    }
  }

  .workspace-status {
    flex: 0 0 80px;
    display: flex;
    justify-content: center;
  }

  .workspace-actions {
    flex: 1;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>