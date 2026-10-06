<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NButton, NCard, NSpace } from 'naive-ui'

const username = ref('')
const password = ref('')
</script>

<template>
  <div class="login-page">
    <n-card title="Automation System" class="login-card">
      <n-space vertical size="large">
        <n-input v-model:value="username" placeholder="Username" size="large" />

        <n-input
          v-model:value="password"
          type="password"
          show-password-on="click"
          placeholder="Password"
          size="large"
        />

        <n-button type="primary" size="large" block> Login </n-button>
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
