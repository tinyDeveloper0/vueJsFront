<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  NAvatar,
  NAlert,
  NBadge,
  NButton,
  NDropdown,
  NDrawer,
  NDrawerContent,
  NEmpty,
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NLayoutHeader,
  NLayoutSider,
  NMenu,
  NModal,
  NPopover,
  NSpin,
  NTag,
  NText,
  useMessage,
} from 'naive-ui'

import type { MenuOption } from 'naive-ui'
import * as IonIcons from '@vicons/ionicons5'

import { useThemeStore } from '@/stores/theme'
import { MoonOutline, SunnyOutline } from '@vicons/ionicons5'

import { useAuthStore } from '@/stores/auth'
import type { MenuItem } from '@/types/auth'

import { useMenuStore } from '@/stores/menu'
import { useNotificationStore } from '@/stores/notifications'
import type { NotificationItem } from '@/types/notification'
import {
  getNotificationPriorityDetails,
  getNotificationTypeDetails,
} from '@/enums/notification'

const menuStore = useMenuStore()
const themeStore = useThemeStore()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const message = useMessage()

const collapsed = ref(false)
const showMobileMenu = ref(false)
const isMobile = ref(window.innerWidth < 768)

const menuOptions = ref<MenuOption[]>([])
const menuLoading = ref(false)
const showNotifications = ref(false)
const selectedNotification = ref<NotificationItem | null>(null)

function updateScreenSize() {
  isMobile.value = window.innerWidth < 768

  if (!isMobile.value) {
    showMobileMenu.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', updateScreenSize)
  void loadUserMenus()
  void notificationStore.connectRealtime()
  void notificationStore.loadUnreadCount()
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

function handleNotificationToggle(visible: boolean): void {
  if (!visible) return

  void notificationStore.connectRealtime()
  void notificationStore.loadPreview()
  void notificationStore.loadUnreadCount()
}

async function selectNotification(notification: NotificationItem): Promise<void> {
  selectedNotification.value = notification

  if (!notification.isRead) {
    try {
      await notificationStore.markAsRead(notification.id)
    } catch {
      message.error('Unable to mark the notification as read.')
    }
  }
}

async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await notificationStore.markAllAsRead()
    message.success('All notifications marked as read.')
  } catch {
    message.error('Unable to mark all notifications as read.')
  }
}

async function openNotificationHistory(): Promise<void> {
  showNotifications.value = false
  await router.push('/notifications')
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

async function handleUserMenu(key: string) {
  if (key === 'logout') {
    menuStore.resetMenus()
    await authStore.logout()
    await router.push('/login')
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

          <n-popover
            v-model:show="showNotifications"
            trigger="click"
            placement="bottom-end"
            :width="360"
            @update:show="handleNotificationToggle"
          >
            <template #trigger>
              <n-badge
                :value="notificationStore.unreadCount"
                :max="99"
                :show="notificationStore.unreadCount > 0"
              >
                <n-button quaternary circle title="Notifications">
                  <template #icon>
                    <n-icon size="22">
                      <component :is="IonIcons.NotificationsOutline" />
                    </n-icon>
                  </template>
                </n-button>
              </n-badge>
            </template>

            <div class="notification-popover">
              <div class="notification-popover-header">
                <strong>Notifications</strong>
                <n-button
                  text
                  size="tiny"
                  :disabled="notificationStore.unreadCount === 0 || notificationStore.markingAllRead"
                  :loading="notificationStore.markingAllRead"
                  @click="markAllNotificationsAsRead"
                >
                  Mark all read
                </n-button>
              </div>

              <n-alert v-if="notificationStore.error" type="error" :show-icon="false">
                {{ notificationStore.error }}
              </n-alert>

              <n-spin :show="notificationStore.previewLoading">
                <div v-if="notificationStore.previewItems.length" class="notification-list">
                  <button
                    v-for="notification in notificationStore.previewItems"
                    :key="notification.id"
                    type="button"
                    class="notification-item"
                    :class="{ unread: !notification.isRead }"
                    :style="{
                      borderLeftColor: getNotificationTypeDetails(notification.notificationType).accentColor,
                    }"
                    @click="selectNotification(notification)"
                  >
                    <div class="notification-item-heading">
                      <span class="notification-item-title">{{ notification.title }}</span>
                      <div class="notification-item-tags">
                        <n-tag
                          :type="getNotificationTypeDetails(notification.notificationType).tagType"
                          size="small"
                        >
                          {{ getNotificationTypeDetails(notification.notificationType).label }}
                        </n-tag>
                        <n-tag
                          :type="getNotificationPriorityDetails(notification.priority).tagType"
                          size="small"
                        >
                          {{ getNotificationPriorityDetails(notification.priority).label }}
                        </n-tag>
                      </div>
                    </div>
                    <n-text depth="3" class="notification-item-date">
                      {{ new Date(notification.createdAt).toLocaleString() }}
                    </n-text>
                    <span class="notification-item-body">{{ notification.body }}</span>
                  </button>
                </div>
                <n-empty
                  v-else-if="!notificationStore.previewLoading"
                  description="No notifications"
                  size="small"
                />
              </n-spin>

              <div class="notification-popover-footer">
                <n-button text type="primary" @click="openNotificationHistory">
                  View all notifications
                </n-button>
                <span v-if="notificationStore.realtimeError" class="realtime-error">
                  Live updates unavailable
                </span>
              </div>
            </div>
          </n-popover>

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

    <n-modal
      :show="selectedNotification !== null"
      preset="card"
      :title="selectedNotification?.title ?? 'Notification'"
      style="width: min(520px, 94vw)"
      @update:show="(show: boolean) => { if (!show) selectedNotification = null }"
    >
      <p v-if="selectedNotification" class="notification-detail-body">
        {{ selectedNotification.body }}
      </p>
      <div v-if="selectedNotification" class="notification-detail-tags">
        <n-tag
          :type="getNotificationTypeDetails(selectedNotification.notificationType).tagType"
        >
          {{ getNotificationTypeDetails(selectedNotification.notificationType).label }}
        </n-tag>
        <n-tag
          :type="getNotificationPriorityDetails(selectedNotification.priority).tagType"
        >
          {{ getNotificationPriorityDetails(selectedNotification.priority).label }}
        </n-tag>
      </div>
      <n-text v-if="selectedNotification" depth="3">
        {{ new Date(selectedNotification.createdAt).toLocaleString() }}
      </n-text>
    </n-modal>
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

.notification-popover {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-popover-header,
.notification-popover-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  padding: 10px;
  border: 0;
  border-left: 4px solid transparent;
  border-radius: 6px;
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.notification-item-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.notification-item-tags,
.notification-detail-tags {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notification-detail-tags {
  margin-bottom: 12px;
}

.notification-item:hover,
.notification-item.unread {
  background: rgba(128, 128, 128, 0.12);
}

.notification-item-title {
  font-weight: 600;
}

.notification-item-date,
.notification-item-body {
  font-size: 12px;
}

.notification-item-body {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.realtime-error {
  color: #d03050;
  font-size: 11px;
}

.notification-detail-body {
  white-space: pre-wrap;
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
