<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NSpace } from 'naive-ui'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const userName = computed(() => {
  return authStore.user?.fullName || authStore.user?.username || 'User'
})
</script>

<template>
  <div class="dashboard">
    <div class="welcome">
      <h1>Welcome, {{ userName }}</h1>

      <p>Welcome to the Automation System dashboard.</p>
    </div>

    <n-space wrap size="large">
      <n-card title="System Status" class="dashboard-card"> System is running normally. </n-card>

      <n-card title="Notifications" class="dashboard-card"> You have 3 new notifications. </n-card>

      <n-card title="Reports" class="dashboard-card"> View your latest reports. </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome {
  margin-bottom: 24px;
}

.welcome h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.welcome p {
  margin: 0;
  opacity: 0.7;
}

.dashboard-card {
  width: 280px;
}

@media (max-width: 767px) {
  .welcome h1 {
    font-size: 22px;
  }

  .dashboard-card {
    width: 100%;
  }
}
</style>
