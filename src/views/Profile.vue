<template>
  <div class="profile">
    <div class="profile-container">
      <div class="profile-header">
        <h1>个人资料</h1>
        <p>管理您的账户信息和偏好设置</p>
      </div>

      <div class="profile-content">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
          >
            <el-form-item label="头像">
              <div class="avatar-section">
                <el-avatar :size="80" :src="profileForm.avatar">
                  {{ profileForm.username?.charAt(0)?.toUpperCase() }}
                </el-avatar>
                <el-button type="primary" size="small" @click="handleAvatarUpload">
                  更换头像
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="profileForm.username"
                placeholder="请输入用户名"
                maxlength="20"
              />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="profileForm.email"
                placeholder="请输入邮箱地址"
                disabled
              />
            </el-form-item>

            <el-form-item label="手机号">
              <el-input
                v-model="profileForm.phone"
                placeholder="请输入手机号"
                maxlength="11"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleSave">
                保存修改
              </el-button>
              <el-button @click="handleCancel">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>
          
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="请输入当前密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="passwordLoading" @click="handlePasswordChange">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <div class="profile-actions">
        <el-button @click="$router.push('/dashboard')">返回工作台</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const profileFormRef = ref()
const passwordFormRef = ref()
const loading = ref(false)
const passwordLoading = ref(false)

const profileForm = reactive({
  username: '',
  email: '',
  phone: '',
  avatar: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2到20个字符', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

onMounted(() => {
  if (authStore.user) {
    Object.assign(profileForm, authStore.user)
  }
})

const handleAvatarUpload = () => {
  ElMessage.info('头像上传功能开发中')
}

const handleSave = async () => {
  if (!profileFormRef.value) return
  
  const valid = await profileFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  loading.value = true
  
  try {
    // 这里应该调用更新用户信息的API
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (authStore.user) {
    Object.assign(profileForm, authStore.user)
  }
}

const handlePasswordChange = async () => {
  if (!passwordFormRef.value) return
  
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  passwordLoading.value = true
  
  try {
    // 这里应该调用修改密码的API
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    ElMessage.success('密码修改成功')
    
    // 重置表单
    passwordFormRef.value.resetFields()
    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error) {
    ElMessage.error('密码修改失败，请稍后重试')
  } finally {
    passwordLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.profile {
  min-height: 100vh;
  background: #1a1a1a;
  padding: 40px 20px;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
  color: #fff;

  h1 {
    font-size: 32px;
    margin: 0 0 8px 0;
    color: #409EFF;
  }

  p {
    font-size: 16px;
    color: #a0aec0;
    margin: 0;
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
}

.profile-card {
  :deep(.el-card__header) {
    background: #2d3748;
    border-bottom: 1px solid #4a5568;
  }

  :deep(.el-card__body) {
    background: #2d3748;
  }

  .card-header {
    color: #fff;
    font-weight: 600;
  }

  .avatar-section {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  :deep(.el-form-item__label) {
    color: #a0aec0;
  }

  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    box-shadow: none;

    &:hover {
      border-color: #409EFF;
    }

    &.is-focus {
      border-color: #409EFF;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
  }

  :deep(.el-input__inner) {
    color: #fff;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    &:disabled {
      color: #a0aec0;
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.profile-actions {
  text-align: center;
}
</style>