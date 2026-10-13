import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { darkTheme } from 'naive-ui'

export type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  const savedTheme = localStorage.getItem('theme')

  return savedTheme === 'dark' ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(getInitialTheme())

  const theme = computed(() => (mode.value === 'dark' ? darkTheme : null))

  function setTheme(value: ThemeMode): void {
    mode.value = value
    localStorage.setItem('theme', value)
  }

  function toggleTheme(): void {
    setTheme(mode.value === 'dark' ? 'light' : 'dark')
  }

  return {
    mode,
    theme,
    setTheme,
    toggleTheme,
  }
})
