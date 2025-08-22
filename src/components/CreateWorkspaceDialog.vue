<template>
  <el-dialog
    v-model="visible"
    title="新建工作空间"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="空间名称" prop="name" required>
        <el-input
          v-model="form.name"
          placeholder="请输入工作空间名称"
          maxlength="50"
        />
      </el-form-item>

      <el-form-item label="模板选择" prop="template" required>
        <el-select v-model="form.template" placeholder="请选择工作空间模板" style="width: 100%;">
          <el-option label="Node.js 开发环境" value="nodejs" />
          <el-option label="Python 开发环境" value="python" />
          <el-option label="Java 开发环境" value="java" />
          <el-option label="Go 开发环境" value="go" />
          <el-option label="空白环境" value="blank" />
        </el-select>
      </el-form-item>

      <el-form-item label="CPU 配置" prop="cpu" required>
        <el-select v-model="form.cpu" placeholder="请选择 CPU 配置" style="width: 100%;">
          <el-option label="1 核 (1000m)" value="1000m" />
          <el-option label="2 核 (2000m)" value="2000m" />
          <el-option label="4 核 (4000m)" value="4000m" />
        </el-select>
      </el-form-item>

      <el-form-item label="内存配置" prop="memory" required>
        <el-select v-model="form.memory" placeholder="请选择内存配置" style="width: 100%;">
          <el-option label="2GB (2048Mi)" value="2048Mi" />
          <el-option label="4GB (4096Mi)" value="4096Mi" />
          <el-option label="8GB (8192Mi)" value="8192Mi" />
        </el-select>
      </el-form-item>

      <el-form-item label="Pod 密码" prop="pod_password" required>
        <el-input
          v-model="form.pod_password"
          type="password"
          placeholder="请输入Pod访问密码"
          show-password
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          新建
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useWorkspaceStore } from '@/stores/workspace'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const workspaceStore = useWorkspaceStore()

const visible = ref(false)
const loading = ref(false)
const formRef = ref()

const form = reactive({
  name: '',
  template: 'nodejs',
  cpu: '2000m',
  memory: '4096Mi',
  user_id: 1,
  pod_password: ''
})

const rules = {
  name: [
    { required: true, message: '请输入工作空间名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在1到50个字符', trigger: 'blur' }
  ],
  template: [
    { required: true, message: '请选择工作空间模板', trigger: 'change' }
  ],
  cpu: [
    { required: true, message: '请选择 CPU 配置', trigger: 'change' }
  ],
  memory: [
    { required: true, message: '请选择内存配置', trigger: 'change' }
  ],
  pod_password: [
    { required: true, message: '请输入Pod访问密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在6到50个字符', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    resetForm()
  }
})

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    name: '',
    template: 'nodejs',
    cpu: '2000m',
    memory: '4096Mi',
    user_id: 1,
    pod_password: ''
  })
}

const handleClose = () => {
  visible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true

  try {
    const result = await workspaceStore.createWorkspace({
      user_id: form.user_id,
      cpu: form.cpu,
      memory: form.memory,
      name: form.name,
      template: form.template,
      pod_password: form.pod_password
    })

    if (result.success) {
      ElMessage.success('工作空间创建成功')
      emit('created', result.data)
      handleClose()
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('创建失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 暗色主题全局样式修复
:deep(.el-dialog) {
  background-color: #2d3748 !important;
  border: 1px solid #4a5568 !important;
  
  .el-dialog__header {
    background-color: #2d3748 !important;
    border-bottom: 1px solid #4a5568 !important;
    
    .el-dialog__title {
      color: #e2e8f0 !important;
    }
    
    .el-dialog__close {
      color: #a0aec0 !important;
      
      &:hover {
        color: #e2e8f0 !important;
      }
    }
  }
  
  .el-dialog__body {
    background-color: #2d3748 !important;
    color: #e2e8f0 !important;
  }
  
  .el-dialog__footer {
    background-color: #2d3748 !important;
    border-top: 1px solid #4a5568 !important;
  }
}

// 表单标签样式
:deep(.el-form-item__label) {
  color: #e2e8f0 !important;
}

// 输入框样式统一
:deep(.el-input) {
  .el-input__wrapper {
    background-color: #1a202c !important;
    border: 1px solid #4a5568 !important;
    box-shadow: none !important;
    
    &:hover {
      border-color: #409EFF !important;
    }
    
    &.is-focus {
      border-color: #409EFF !important;
      box-shadow: 0 0 0 1px #409EFF !important;
    }
  }
  
  .el-input__inner {
    background-color: transparent !important;
    color: #e2e8f0 !important;
    
    &::placeholder {
      color: #718096 !important;
    }
  }
  
  // 密码显示/隐藏按钮
  .el-input__suffix {
    .el-input__suffix-inner {
      color: #a0aec0 !important;
      
      &:hover {
        color: #e2e8f0 !important;
      }
    }
  }
}

// 字数统计样式
:deep(.el-input__count) {
  color: #718096 !important;
  background-color: transparent !important;
}

// 选择框样式
:deep(.el-select) {
  .el-select__wrapper {
    background-color: #1a202c !important;
    border: 1px solid #4a5568 !important;
    box-shadow: none !important;
    
    &:hover {
      border-color: #409EFF !important;
    }
    
    &.is-focused {
      border-color: #409EFF !important;
      box-shadow: 0 0 0 1px #409EFF !important;
    }
  }
  
  .el-select__selection {
    color: #e2e8f0 !important;
  }
  
  .el-select__selected-item {
    color: #e2e8f0 !important;
  }
  
  .el-select__placeholder {
    color: #718096 !important;
  }
  
  .el-select__caret {
    color: #a0aec0 !important;
  }
  
  // 修复选中项的文字颜色
  .el-input .el-input__inner {
    color:rgb(8, 8, 8) !important;
  }
}

// 下拉菜单样式
:deep(.el-select-dropdown) {
  background-color: #2d3748 !important;
  border: 1px solid #4a5568 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
}

:deep(.el-select-dropdown__item) {
  color: #e2e8f0 !important;
  background-color: transparent !important;
  
  &:hover {
    background-color: #4a5568 !important;
    color: #ffffff !important;
  }
  
  &.is-selected {
    background-color: #409EFF !important;
    color: #ffffff !important;
    
    &:hover {
      background-color: #409EFF !important;
      color: #ffffff !important;
    }
  }
  
  &.hover {
    background-color: #4a5568 !important;
    color: #ffffff !important;
  }
}

// Popper弹出层样式
:deep(.el-popper) {
  background-color: #2d3748 !important;
  border: 1px solid #4a5568 !important;
  
  &.is-dark {
    background-color: #2d3748 !important;
    border-color: #4a5568 !important;
  }
  
  .el-popper__arrow::before {
    background-color: #2d3748 !important;
    border: 1px solid #4a5568 !important;
  }
}

// 按钮样式优化
:deep(.el-button) {
  &.el-button--default {
    background-color: #4a5568 !important;
    border-color: #4a5568 !important;
    color: #e2e8f0 !important;
    
    &:hover {
      background-color: #718096 !important;
      border-color: #718096 !important;
    }
  }
  
  &.el-button--primary {
    background-color: #409EFF !important;
    border-color: #409EFF !important;
    
    &:hover {
      background-color: #66b3ff !important;
      border-color: #66b3ff !important;
    }
    
    &.is-loading {
      background-color: #409EFF !important;
      border-color: #409EFF !important;
    }
  }
}

// 表单验证错误提示
:deep(.el-form-item__error) {
  color: #f56565 !important;
}

// 修复表单项间距
:deep(.el-form-item) {
  margin-bottom: 22px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

// 增加更具体的选择框输入框颜色控制
:deep(.el-select .el-input__wrapper .el-input__inner) {
  color: #e2e8f0 !important;
}

:deep(.el-select:not(.is-disabled):hover .el-input__wrapper .el-input__inner) {
  color: #e2e8f0 !important;
}

:deep(.el-select.is-focused .el-input__wrapper .el-input__inner) {
  color: #e2e8f0 !important;
}
</style>
