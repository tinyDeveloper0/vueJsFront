<script setup lang="ts">
import { NResult, NButton, NSpace } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="not-found">
    <n-result
      status="404"
      title="404 - Page Not Found"
      description="The page you are looking for does not exist or has not been implemented yet."
    >
      <template #footer>
        <n-space justify="center">
          <n-button @click="goBack"> Go Back </n-button>

          <n-button type="primary" @click="goHome"> Go Home </n-button>
        </n-space>
      </template>
    </n-result>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
</style>
