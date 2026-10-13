<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  NAvatar,
  NBadge,
  NButton,
  NDropdown,
  NDrawer,
  NDrawerContent,
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NLayoutHeader,
  NLayoutSider,
  NMenu,
  useMessage,
} from 'naive-ui'

import type { MenuOption } from 'naive-ui'
import * as IonIcons from '@vicons/ionicons5'

import { getUserMenus } from '@/api/authApi'

import { useThemeStore } from '@/stores/theme'
import { MoonOutline, SunnyOutline } from '@vicons/ionicons5'

import { useAuthStore } from '@/stores/auth'
import type { MenuItem } from '@/types/auth'

import { useMenuStore } from '@/stores/menu'

const menuStore = useMenuStore()
const themeStore = useThemeStore()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const collapsed = ref(false)
const showMobileMenu = ref(false)
const isMobile = ref(window.innerWidth < 768)

const menuOptions = ref<MenuOption[]>([])
const menuLoading = ref(false)

function updateScreenSize() {
  isMobile.value = window.innerWidth < 768

  if (!isMobile.value) {
    showMobileMenu.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', updateScreenSize)
  void loadUserMenus()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})

const selectedMenuKey = computed(() => route.path)

const userName = computed(() => {
  return authStore.user?.fullName || authStore.user?.username || 'User'
})

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

const userMenuOptions = [
  {
    label: 'Logout',
    key: 'logout',
  },
]

/**
 * Converts backend menu items to Naive UI menu options.
 */
function mapMenuItems(items: MenuItem[]): MenuOption[] {
  return [...items]
    .sort((a, b) => (a.position ?? 255) - (b.position ?? 255))
    .map((item) => {
      const option: MenuOption = {
        label: item.title,
        key: item.route || `menu-${item.id}`,
      }

      const icon = renderMenuIcon(item.icon)

      if (icon) {
        option.icon = icon
      }

      if (item.subMenus?.length) {
        option.children = mapMenuItems(item.subMenus)
      }

      return option
    })
}

/**
 * Resolves an icon name received from the backend.
 * Example: HomeOutline, SettingsOutline, PeopleOutline.
 */
function renderMenuIcon(iconName: string | null): MenuOption['icon'] {
  if (!iconName) {
    return undefined
  }

  const iconComponent = (IonIcons as unknown as Record<string, Parameters<typeof h>[0]>)[iconName]

  if (!iconComponent) {
    console.warn(`Menu icon "${iconName}" was not found.`)
    return undefined
  }

  return () =>
    h(NIcon, null, {
      default: () => h(iconComponent),
    })
}

/**
 * Loads the current user's menu from the backend.
 */
async function loadUserMenus(): Promise<void> {
  try {
    await menuStore.loadMenus()
    menuOptions.value = mapMenuItems(menuStore.items)
  } catch (error: unknown) {
    console.error('Failed to load menus:', error)
    message.error(error instanceof Error ? error.message : 'Failed to load menus.')
  }
}
function handleMenuSelect(key: string) {
  // Parent items without routes are used only to expand submenus.
  if (key.startsWith('menu-')) {
    return
  }

  if (key !== route.path) {
    void router.push(key)
  }

  showMobileMenu.value = false
}

function handleUserMenu(key: string) {
  if (key === 'logout') {
    menuStore.resetMenus()
    authStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <n-layout has-sider class="app-layout">
    <!-- Desktop Sidebar -->
    <n-layout-sider
      v-if="!isMobile"
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
    >
      <div class="logo">
        <span v-if="!collapsed">Automation System</span>
        <span v-else>AS</span>
      </div>

      <n-menu
        :value="selectedMenuKey"
        :options="menuOptions"
        :collapsed="collapsed"
        :loading="menuLoading"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>

    <!-- Mobile Menu -->
    <n-drawer v-model:show="showMobileMenu" placement="left" :width="260">
      <n-drawer-content title="Automation System">
        <n-menu
          :value="selectedMenuKey"
          :options="menuOptions"
          :loading="menuLoading"
          @update:value="handleMenuSelect"
        />
      </n-drawer-content>
    </n-drawer>

    <!-- Main Layout -->
    <n-layout>
      <!-- Header -->
      <n-layout-header bordered class="header">
        <div class="header-left">
          <n-button
            quaternary
            circle
            @click="isMobile ? (showMobileMenu = true) : (collapsed = !collapsed)"
          >
            <template #icon>
              <n-icon size="22">
                <component :is="IonIcons.MenuOutline" />
              </n-icon>
            </template>
          </n-button>

          <span class="page-title">Automation System</span>
        </div>

        <div class="header-right">
          <n-button
            quaternary
            circle
            :title="themeStore.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="themeStore.toggleTheme()"
          >
            <template #icon>
              <n-icon size="22">
                <SunnyOutline v-if="themeStore.mode === 'dark'" />
                <MoonOutline v-else />
              </n-icon>
            </template>
          </n-button>

          <n-badge :value="3" :max="99">
            <n-button quaternary circle>
              <template #icon>
                <n-icon size="22">
                  <component :is="IonIcons.NotificationsOutline" />
                </n-icon>
              </template>
            </n-button>
          </n-badge>

          <n-dropdown :options="userMenuOptions" trigger="click" @select="handleUserMenu">
            <n-button quaternary class="user-button">
              <n-avatar round>
                {{ userInitial }}
              </n-avatar>

              <span class="user-name">
                {{ userName }}
              </span>
            </n-button>
          </n-dropdown>
        </div>
      </n-layout-header>

      <!-- Page Content -->
      <n-layout-content class="content">
        <router-view />
      </n-layout-content>

      <!-- Footer -->
      <n-layout-footer bordered class="footer"> Automation System © 2026 </n-layout-footer>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
}

.header {
  height: 64px;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.header-left {
  gap: 12px;
}

.header-right {
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content {
  padding: 24px;
  box-sizing: border-box;
  min-width: 0;
  min-height: calc(100vh - 112px);
}

.footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

@media (max-width: 767px) {
  .header {
    padding: 0 12px;
  }

  .page-title {
    font-size: 16px;
  }

  .user-name {
    display: none;
  }

  .content {
    padding: 16px;
    min-height: calc(100vh - 112px);
  }
}
</style>
