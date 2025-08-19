<template>
  <div class="create-workspace">
    <div class="create-header">
      <h1>新建工作空间</h1>
      <p>创建一个新的云端开发环境</p>
    </div>
    
    <CreateWorkspaceDialog
      v-model="showDialog"
      @created="handleCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CreateWorkspaceDialog from '@/components/CreateWorkspaceDialog.vue'

const router = useRouter()
const showDialog = ref(false)

onMounted(() => {
  showDialog.value = true
})

const handleCreated = (workspace) => {
  router.push('/dashboard')
}
</script>

<style scoped lang="scss">
.create-workspace {
  min-height: 100vh;
  background: #1a1a1a;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.create-header {
  text-align: center;
  color: #fff;
  margin-bottom: 32px;

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
</style>