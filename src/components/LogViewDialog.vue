<template>
  <el-dialog
    v-model="visible"
    :title="`${workspaceName} - 工作空间日志`"
    width="80%"
    @close="handleClose"
    class="log-dialog"
  >
    <div class="log-container" v-loading="loading">
      <div class="log-header">
        <div class="log-info">
          <span class="log-workspace">工作空间: {{ workspaceName }}</span>
          <span class="log-time">查询时间: {{ formatDateTime(new Date()) }}</span>
        </div>
        <div class="log-actions">
          <el-button size="small" @click="copyLog">
            <el-icon><DocumentCopy /></el-icon>
            复制
          </el-button>
          <el-button size="small" @click="downloadLog">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
        </div>
      </div>
      
      <div class="log-content">
        <el-scrollbar height="500px">
          <pre class="log-text" ref="logTextRef">{{ logContent || '暂无日志内容' }}</pre>
        </el-scrollbar>
      </div>
      
      <div class="log-footer">
        <el-text type="info" size="small">
          日志内容自动滚动到底部 | 共 {{ logLineCount }} 行
        </el-text>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Download } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  workspaceName: {
    type: String,
    default: ''
  },
  logContent: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const logTextRef = ref(null)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const logLineCount = computed(() => {
  if (!props.logContent) return 0
  return props.logContent.split('\n').length
})

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleString('zh-CN')
}

// 监听日志内容变化，自动滚动到底部
watch(() => props.logContent, async () => {
  if (props.logContent) {
    await nextTick()
    scrollToBottom()
  }
})

// 滚动到底部
const scrollToBottom = () => {
  if (logTextRef.value) {
    logTextRef.value.scrollTop = logTextRef.value.scrollHeight
  }
}

// 复制日志
const copyLog = async () => {
  if (!props.logContent) {
    ElMessage.warning('暂无日志内容可复制')
    return
  }
  
  try {
    await navigator.clipboard.writeText(props.logContent)
    ElMessage.success('日志内容已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 下载日志
const downloadLog = () => {
  if (!props.logContent) {
    ElMessage.warning('暂无日志内容可下载')
    return
  }
  
  try {
    const blob = new Blob([props.logContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = `${props.workspaceName}-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('日志文件下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.log-dialog {
  :deep(.el-dialog) {
    background: #2d3748;
    border: 1px solid #4a5568;
  }
  
  :deep(.el-dialog__header) {
    background: #2d3748;
    border-bottom: 1px solid #4a5568;
    padding: 16px 20px;
    
    .el-dialog__title {
      color: #409EFF;
      font-weight: 600;
    }
  }
  
  :deep(.el-dialog__body) {
    background: #1a202c;
    padding: 0;
  }
  
  :deep(.el-dialog__footer) {
    background: #2d3748;
    border-top: 1px solid #4a5568;
    padding: 12px 20px;
  }
}

.log-container {
  background: #1a202c;
  color: #e2e8f0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #2d3748;
  border-bottom: 1px solid #4a5568;
  
  .log-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .log-workspace {
      font-weight: 600;
      color: #409EFF;
      font-size: 14px;
    }
    
    .log-time {
      font-size: 12px;
      color: #a0aec0;
    }
  }
  
  .log-actions {
    display: flex;
    gap: 8px;
    
    .el-button {
      height: 28px;
      padding: 6px 12px;
      font-size: 12px;
      
      :deep(.el-icon) {
        font-size: 14px;
      }
    }
  }
}

.log-content {
  background: #1a202c;
  
  .log-text {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
    color: #e2e8f0;
    background: transparent;
    border: none;
    outline: none;
    margin: 0;
    padding: 16px 20px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    
    // 高亮关键词
    &:deep(.log-error) {
      color: #f56565;
      font-weight: bold;
    }
    
    &:deep(.log-warning) {
      color: #ed8936;
      font-weight: bold;
    }
    
    &:deep(.log-info) {
      color: #4fd1c7;
    }
    
    &:deep(.log-debug) {
      color: #a0aec0;
    }
  }
}

.log-footer {
  padding: 12px 20px;
  background: #2d3748;
  border-top: 1px solid #4a5568;
  text-align: center;
}

.dialog-footer {
  text-align: right;
}

// 响应式适配
@media (max-width: 768px) {
  .log-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
  
  .log-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    
    .log-actions {
      justify-content: center;
    }
  }
  
  .log-content .log-text {
    font-size: 11px;
    padding: 12px 16px;
  }
}
</style>