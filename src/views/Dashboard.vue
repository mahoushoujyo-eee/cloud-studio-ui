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
            <el-button type="primary" @click="showCreateDialog = true">新建</el-button>
          </div>
        </div>

        <!-- 工作空间列表 -->
        <div class="workspace-list">
          <div class="list-header">
            <div class="filter-tabs">
              <span class="tab active">最近使用</span>
              <span class="tab">按名称</span>
              <span class="tab">按时间</span>
            </div>
            <div class="list-actions">
              <span>排序：</span>
              <el-select v-model="sortBy" size="small" style="width: 120px;">
                <el-option label="最近创建" value="recent" />
                <el-option label="名称" value="name" />
              </el-select>
            </div>
          </div>

          <!-- 工作空间卡片 -->
          <div class="workspace-cards" v-loading="loading">
            <div
              v-for="workspace in workspaces"
              :key="workspace.id"
              class="workspace-card"
            >
              <div class="card-header">
                <div class="workspace-info">
                  <el-icon class="workspace-icon"><Code /></el-icon>
                  <div>
                    <h4 class="workspace-name">{{ workspace.name }}</h4>
                    <p class="workspace-desc">{{ workspace.description || '暂无描述' }}</p>
                  </div>
                </div>
                <div class="workspace-status">
                  <el-tag
                    :type="getStatusType(workspace.status)"
                    size="small"
                  >
                    {{ getStatusText(workspace.status) }}
                  </el-tag>
                </div>
              </div>

              <div class="card-content">
                <div class="workspace-tags">
                  <el-tag
                    v-for="tag in workspace.tags"
                    :key="tag"
                    size="small"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <div class="workspace-meta">
                  <span class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    创建时间：{{ formatDate(workspace.createdAt) }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Clock /></el-icon>
                    最近使用：{{ formatDate(workspace.lastUsed) }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Monitor /></el-icon>
                    规格配置：{{ workspace.spec }}
                  </span>
                </div>
              </div>

              <div class="card-actions">
                <el-button
                  v-if="workspace.status === 'running'"
                  type="success"
                  size="small"
                  @click="openWorkspace(workspace)"
                >
                  <el-icon><Link /></el-icon>
                  打开
                </el-button>
                <el-button
                  v-else-if="workspace.status === 'stopped'"
                  type="primary"
                  size="small"
                  :loading="workspace.starting"
                  @click="startWorkspace(workspace)"
                >
                  <el-icon><VideoPlay /></el-icon>
                  启动
                </el-button>
                <el-button
                  v-if="workspace.status === 'running'"
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
  workspaceStore.fetchWorkspaces()
})

const getStatusType = (status) => {
  const statusMap = {
    running: 'success',
    stopped: 'info',
    starting: 'warning',
    error: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    running: '运行中',
    stopped: '已停止',
    starting: '启动中',
    error: '错误'
  }
  return statusMap[status] || '未知'
}

const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN')
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
    const result = await workspaceStore.getWorkspaceUrl(workspace.id)
    if (result.success) {
      window.open(result.url, '_blank')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('获取访问地址失败')
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
        const result = await workspaceStore.deleteWorkspace(workspace.id)
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

const handleWorkspaceCreated = () => {
  workspaceStore.fetchWorkspaces()
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
  }
}

.workspace-list {
  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    .filter-tabs {
      display: flex;
      gap: 24px;

      .tab {
        font-size: 14px;
        color: #a0aec0;
        cursor: pointer;
        padding-bottom: 8px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;

        &:hover {
          color: #409EFF;
        }

        &.active {
          color: #409EFF;
          border-bottom-color: #409EFF;
        }
      }
    }

    .list-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #a0aec0;
    }
  }
}

.workspace-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.workspace-card {
  background: #2d3748;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #4a5568;
  transition: all 0.2s;

  &:hover {
    border-color: #409EFF;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;

    .workspace-info {
      display: flex;
      gap: 12px;

      .workspace-icon {
        font-size: 20px;
        color: #409EFF;
        margin-top: 2px;
      }

      .workspace-name {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 4px 0;
      }

      .workspace-desc {
        font-size: 14px;
        color: #a0aec0;
        margin: 0;
      }
    }
  }

  .card-content {
    margin-bottom: 16px;

    .workspace-tags {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .workspace-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #a0aec0;
      }
    }
  }

  .card-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}
</style>