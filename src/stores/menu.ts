import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getUserMenus } from '@/api/authApi'
import type { MenuItem } from '@/types/auth'

export const useMenuStore = defineStore('menu', () => {
  const items = ref<MenuItem[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  async function loadMenus(): Promise<void> {
    if (loaded.value || loading.value) return

    loading.value = true

    try {
      items.value = await getUserMenus()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  function resetMenus(): void {
    items.value = []
    loaded.value = false
  }

  return {
    items,
    loading,
    loaded,
    loadMenus,
    resetMenus,
  }
})
