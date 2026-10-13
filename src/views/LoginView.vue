<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NButton, NCard, NSpace, useMessage } from 'naive-ui'

import { useAuthStore } from '@/stores/auth'

const username = ref('')
const password = ref('')
const loading = ref(false)

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

async function handleLogin() {
  if (!username.value || !password.value) {
    message.warning('Please enter username and password.')
    return
  }

  loading.value = true

  try {
    await authStore.login(username.value, password.value)

    message.success('Login successful.')

    router.push('/dashboard')
  } catch (error) {
    console.error(error)

    if (error instanceof Error) {
      message.error(error.message)
    } else {
      message.error('An unexpected error occurred.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <n-card title="Automation System" class="login-card">
      <n-space vertical size="large">
        <n-input
          v-model:value="username"
          placeholder="Username"
          size="large"
          @keyup.enter="handleLogin"
        />

        <n-input
          v-model:value="password"
          type="password"
          show-password-on="click"
          placeholder="Password"
          size="large"
          @keyup.enter="handleLogin"
        />

        <n-button type="primary" size="large" block :loading="loading" @click="handleLogin">
          Login
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.login-card {
  width: 400px;
  max-width: 100%;
}
</style>
