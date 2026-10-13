<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NMessageProvider } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <n-config-provider :theme="themeStore.theme">
    <n-global-style />

    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>
