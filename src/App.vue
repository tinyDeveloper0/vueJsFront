<script setup lang="ts">
import { darkTheme, NConfigProvider, NGlobalStyle } from 'naive-ui'
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-global-style />
    <router-view />
  </n-config-provider>
</template>
