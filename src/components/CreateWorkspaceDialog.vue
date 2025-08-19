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
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="空间描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="简要描述一下这个工作空间的作用"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="代码来源" prop="source" required>
        <el-radio-group v-model="form.source">
          <el-radio label="import">导入仓库</el-radio>
          <el-radio label="template">仓库地址</el-radio>
          <el-radio label="blank">空间模板</el-radio>
          <el-radio label="empty">空</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.source === 'import'" label="选择仓库服务商">
        <div class="repo-providers">
          <div class="provider-item" :class="{ active: form.provider === 'coding' }" @click="form.provider = 'coding'">
            <div class="provider-logo">CODING</div>
          </div>
          <div class="provider-item" :class="{ active: form.provider === 'github' }" @click="form.provider = 'github'">
            <div class="provider-logo">GitHub</div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="开发环境" prop="environment" required>
        <el-select v-model="form.environment" placeholder="请选择开发环境" style="width: 100%;">
          <el-option label="All in One" value="all-in-one" />
          <el-option label="Node.js" value="nodejs" />
          <el-option label="Python" value="python" />
          <el-option label="Java" value="java" />
          <el-option label="Go" value="go" />
        </el-select>
      </el-form-item>

      <el-form-item label="版本">
        <el-select v-model="form.version" placeholder="请选择版本" style="width: 100%;">
          <el-option label="full 1.0.0" value="1.0.0" />
          <el-option label="lite 1.0.0" value="1.0.0-lite" />
        </el-select>
      </el-form-item>

      <el-form-item label="规格配置" prop="spec" required>
        <el-select v-model="form.spec" placeholder="请选择规格配置" style="width: 100%;">
          <el-option label="免费版 1核2GB内存 / 8GB 存储" value="free" />
          <el-option label="基础版 2核4GB内存 / 20GB 存储" value="basic" />
          <el-option label="专业版 4核8GB内存 / 50GB 存储" value="pro" />
        </el-select>
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
  description: '',
  source: 'import',
  provider: 'coding',
  environment: 'all-in-one',
  version: '1.0.0',
  spec: 'free'
})

const rules = {
  name: [
    { required: true, message: '请输入工作空间名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在1到50个字符', trigger: 'blur' }
  ],
  source: [
    { required: true, message: '请选择代码来源', trigger: 'change' }
  ],
  environment: [
    { required: true, message: '请选择开发环境', trigger: 'change' }
  ],
  spec: [
    { required: true, message: '请选择规格配置', trigger: 'change' }
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
    description: '',
    source: 'import',
    provider: 'coding',
    environment: 'all-in-one',
    version: '1.0.0',
    spec: 'free'
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
      name: form.name,
      description: form.description,
      source: form.source,
      provider: form.provider,
      environment: form.environment,
      version: form.version,
      spec: form.spec
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
.repo-providers {
  display: flex;
  gap: 16px;

  .provider-item {
    flex: 1;
    padding: 16px;
    border: 2px solid #4a5568;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #409EFF;
    }

    &.active {
      border-color: #409EFF;
      background: rgba(64, 158, 255, 0.1);
    }

    .provider-logo {
      font-weight: 600;
      color: #fff;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
