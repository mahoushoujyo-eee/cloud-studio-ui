<template>
  <div class="workspace-detail">
    <div class="detail-container">
      <div class="detail-header">
        <div class="header-left">
          <el-button @click="$router.push('/dashboard')" type="text">
            <el-icon><ArrowLeft /></el-icon>
            返回工作台
          </el-button>
          <h1>{{ workspace?.name || '工作空间详情' }}</h1>
        </div>
        <div class="header-right">
          <el-button
            v-if="workspace?.status === 'running'"
            type="success"
            @click="openWorkspace"
          >
            <el-icon><Link /></el-icon>
            打开编辑器
          </el-button>
          <el-button
            v-else-if="workspace?.status === 'stopped'"
            type="primary"
            :loading="starting"
            @click="startWorkspace"
          >
            <el-icon><VideoPlay /></el-icon>
            启动
          </el-button>
          <el-button
            v-if="workspace?.status === 'running'"
            type="warning"
            :loading="stopping"
            @click="stopWorkspace"
          >
            <el-icon><VideoPause /></el-icon>
            停止
          </el-button>
        </div>
      </div>

      <div class="detail-content" v-loading="loading">
        <div class="detail-grid">
          <!-- 基本信息 -->
          <el-card class="detail-card">
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>基本信息</span>
              </div>
            </template>
            
            <div class="info-list">
              <div class="info-item">
                <span class="label">工作空间名称：</span>
                <span class="value">{{ workspace?.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">描述：</span>
                <span class="value">{{ workspace?.description || '暂无描述' }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态：</span>
                <el-tag :type="getStatusType(workspace?.status)" size="small">
                  {{ getStatusText(workspace?.status) }}
                </el-tag>
              </div>
              <div class="info-item">
                <span class="label">创建时间：</span>
                <span class="value">{{ formatDate(workspace?.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="label">最近使用：</span>
                <span class="value">{{ formatDate(workspace?.lastUsed) }}</span>
              </div>
            </div>
          </el-card>

          <!-- 配置信息 -->
          <el-card class="detail-card">
            <template #header>
              <div class="card-header">
                <el-icon><Setting /></el-icon>
                <span>配置信息</span>
              </div>
            </template>
            
            <div class="info-list">
              <div class="info-item">
                <span class="label">开发环境：</span>
                <span class="value">{{ workspace?.environment }}</span>
              </div>
              <div class="info-item">
                <span class="label">版本：</span>
                <span class="value">{{ workspace?.version }}</span>
              </div>
              <div class="info-item">
                <span class="label">规格配置：</span>
                <span class="value">{{ workspace?.spec }}</span>
              </div>
              <div class="info-item">
                <span class="label">代码来源：</span>
                <span class="value">{{ getSourceText(workspace?.source) }}</span>
              </div>
              <div class="info-item" v-if="workspace?.provider">
                <span class="label">仓库服务商：</span>
                <span class="value">{{ workspace?.provider }}</span>
              </div>
            </div>
          </el-card>

          <!-- 资源使用 -->
          <el-card class="detail-card">
            <template #header>
              <div class="card-header">
                <el-icon><Monitor /></el-icon>
                <span>资源使用</span>
              </div>
            </template>
            
            <div class="resource-stats">
              <div class="stat-item">
                <div class="stat-label">CPU使用率</div>
                <el-progress :percentage="workspace?.stats?.cpu || 0" />
              </div>
              <div class="stat-item">
                <div class="stat-label">内存使用率</div>
                <el-progress :percentage="workspace?.stats?.memory || 0" />
              </div>
              <div class="stat-item">
                <div class="stat-label">存储使用率</div>
                <el-progress :percentage="workspace?.stats?.storage || 0" />
              </div>
            </div>
          </el-card>

          <!-- 操作日志 -->
          <el-card class="detail-card full-width">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>操作日志</span>
              </div>
            </template>
            
            <div class="log-list">
              <div
                v-for="log in workspace?.logs || []"
                :key="log.id"
                class="log-item"
              >
                <div class="log-time">{{ formatDateTime(log.timestamp) }}</div>
                <div class="log-action">{{ log.action }}</div>
                <div class="log-status" :class="log.status">{{ log.status }}</div>
              </div>
              <div v-if="!workspace?.logs?.length" class="empty-logs">
                暂无操作日志
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useWorkspaceStore } from '@/stores/workspace'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const loading = ref(false)
const starting = ref(false)
const stopping = ref(false)

const workspace = computed(() => workspaceStore.currentWorkspace)

onMounted(() => {
  fetchWorkspaceDetail()
})

const fetchWorkspaceDetail = async () => {
  loading.value = true
  try {
    const result = await workspaceStore.getWorkspaceDetail(route.params.id)
    if (!result.success) {
      ElMessage.error(result.message)
      router.push('/dashboard')
    }
  } finally {
    loading.value = false
  }
}

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

const getSourceText = (source) => {
  const sourceMap = {
    import: '导入仓库',
    template: '仓库地址',
    blank: '空间模板',
    empty: '空'
  }
  return sourceMap[source] || '未知'
}

const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleString('zh-CN')
}

const startWorkspace = async () => {
  starting.value = true
  try {
    const result = await workspaceStore.startWorkspace(route.params.id)
    if (result.success) {
      ElMessage.success('工作空间启动成功')
      await fetchWorkspaceDetail()
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    starting.value = false
  }
}

const stopWorkspace = async () => {
  stopping.value = true
  try {
    const result = await workspaceStore.stopWorkspace(route.params.id)
    if (result.success) {
      ElMessage.success('工作空间已停止')
      await fetchWorkspaceDetail()
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    stopping.value = false
  }
}

const openWorkspace = async () => {
  try {
    const result = await workspaceStore.getWorkspaceUrl(route.params.id)
    if (result.success) {
      window.open(result.url, '_blank')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('获取访问地址失败')
  }
}
</script>

<style scoped lang="scss">
.workspace-detail {
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #4a5568;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    h1 {
      font-size: 24px;
      margin: 0;
      color: #409EFF;
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.detail-content {
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;

    .full-width {
      grid-column: 1 / -1;
    }
  }
}

.detail-card {
  :deep(.el-card__header) {
    background: #2d3748;
    border-bottom: 1px solid #4a5568;
  }

  :deep(.el-card__body) {
    background: #2d3748;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-weight: 600;
  }
}

.info-list {
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #a0aec0;
      min-width: 120px;
      font-size: 14px;
    }

    .value {
      color: #fff;
      font-size: 14px;
    }
  }
}

.resource-stats {
  .stat-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .stat-label {
      color: #a0aec0;
      font-size: 14px;
      margin-bottom: 8px;
    }
  }
}

.log-list {
  .log-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #4a5568;

    &:last-child {
      border-bottom: none;
    }

    .log-time {
      color: #a0aec0;
      font-size: 12px;
      min-width: 150px;
    }

    .log-action {
      flex: 1;
      color: #fff;
      font-size: 14px;
      margin: 0 16px;
    }

    .log-status {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;

      &.success {
        background: rgba(103, 194, 58, 0.2);
        color: #67c23a;
      }

      &.error {
        background: rgba(245, 108, 108, 0.2);
        color: #f56c6c;
      }

      &.warning {
        background: rgba(230, 162, 60, 0.2);
        color: #e6a23c;
      }
    }
  }

  .empty-logs {
    text-align: center;
    color: #a0aec0;
    padding: 40px 0;
    font-size: 14px;
  }
}
</style>