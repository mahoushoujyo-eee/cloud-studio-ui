<template>
  <div class="reset-container">
    <div class="reset-card">
      <div class="reset-header">
        <h1>找回密码</h1>
        <p>输入您的邮箱地址和验证码，设置新密码</p>
      </div>
      
      <el-form
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        class="reset-form"
        @submit.prevent="handleReset"
      >
        <el-form-item prop="receiver">
          <el-input
            v-model="resetForm.receiver"
            placeholder="邮箱地址"
            size="large"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-input-group">
            <el-input
              v-model="resetForm.code"
              placeholder="验证码"
              size="large"
              prefix-icon="Key"
              style="flex: 1;"
            />
            <el-button
              type="primary"
              size="large"
              :loading="codeLoading"
              :disabled="codeDisabled"
              @click="sendCode"
              class="code-btn"
            >
              {{ codeButtonText }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="resetForm.password"
            type="password"
            placeholder="新密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="confirmPassword"
            type="password"
            placeholder="确认新密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleReset"
            class="reset-btn"
          >
            重置密码
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="reset-footer">
        <router-link to="/login" class="link">返回登录</router-link>
        <span>还没有账号？</span>
        <router-link to="/register" class="link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { sendResetCode, resetPassword } from '@/api/auth'

const router = useRouter()

const resetFormRef = ref()
const loading = ref(false)
const codeLoading = ref(false)
const countdown = ref(0)
const confirmPassword = ref('')

const resetForm = reactive({
  receiver: '',
  code: '',
  password: '',
  type: 'reset'
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== resetForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  receiver: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const codeDisabled = computed(() => {
  return countdown.value > 0 || !resetForm.receiver || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetForm.receiver)
})

const codeButtonText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}s后重发` : '发送验证码'
})

const sendCode = async () => {
  if (!resetForm.receiver) {
    ElMessage.error('请先输入邮箱地址')
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetForm.receiver)) {
    ElMessage.error('请输入正确的邮箱格式')
    return
  }

  codeLoading.value = true

  try {
    await sendResetCode({ email: resetForm.receiver })
    ElMessage.success('验证码已发送，请查收邮件')
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error('验证码发送失败，请稍后重试')
  } finally {
    codeLoading.value = false
  }
}

const handleReset = async () => {
  if (!resetFormRef.value) return
  
  const valid = await resetFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  loading.value = true
  
  try {
    const response = await resetPassword(resetForm)
    if (response.data.statuscode === 200) {
      ElMessage.success('密码重置成功，请使用新密码登录')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      ElMessage.error(response.data.message || '重置失败')
    }
  } catch (error) {
    ElMessage.error('重置失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.reset-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.reset-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.reset-header {
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    color: #409EFF;
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
  }
}

.reset-form {
  .el-form-item {
    margin-bottom: 24px;
  }
  
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
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
  }
  
  :deep(.el-input__prefix-inner) {
    color: rgba(255, 255, 255, 0.6);
  }
}

.code-input-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.code-btn {
  min-width: 120px;
  height: 40px;
  font-size: 14px;
  border-radius: 8px;
  
  &:disabled {
    opacity: 0.6;
  }
}

.reset-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #409EFF 0%, #66b3ff 100%);
  border: none;
  
  &:hover {
    background: linear-gradient(135deg, #66b3ff 0%, #409EFF 100%);
  }
}

.reset-footer {
  text-align: center;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  
  .link {
    color: #409EFF;
    text-decoration: none;
    margin: 0 8px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>