<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NAlert,
  NButton,
  NCard,
  NEmpty,
  NPagination,
  NSpin,
  NTag,
  NText,
  useMessage,
} from 'naive-ui'

import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import type { NotificationItem } from '@/types/notification'
import {
  getNotificationPriorityDetails,
  getNotificationTypeDetails,
} from '@/enums/notification'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const router = useRouter()
const message = useMessage()
const selectedNotification = ref<NotificationItem | null>(null)

onMounted(() => {
  void notificationStore.loadHistory(1, 10)
  void notificationStore.loadUnreadCount()
  void notificationStore.connectRealtime()
})

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

function handlePageChange(page: number): void {
  void notificationStore.loadHistory(page)
}

function handlePageSizeChange(pageSize: number): void {
  void notificationStore.loadHistory(1, pageSize)
}

function closeDetails(): void {
  selectedNotification.value = null
}

function openManagement(): void {
  void router.push('/notification-admin')
}

async function markAllAsRead(): Promise<void> {
  try {
    await notificationStore.markAllAsRead()
    message.success('All notifications marked as read.')
  } catch {
    message.error('Unable to mark all notifications as read.')
  }
}
</script>

<template>
  <n-card title="Notification History">
    <template #header-extra>
      <n-button v-if="authStore.user?.isAdmin" type="primary" @click="openManagement">
        Manage notifications
      </n-button>
    </template>

    <n-alert v-if="notificationStore.error" type="error" class="history-error">
      {{ notificationStore.error }}
    </n-alert>

    <n-spin :show="notificationStore.historyLoading">
      <div v-if="notificationStore.historyItems.length" class="notification-history">
        <button
          v-for="notification in notificationStore.historyItems"
          :key="notification.id"
          type="button"
          class="history-item"
          :class="{ unread: !notification.isRead }"
          :style="{
            borderLeftColor: getNotificationTypeDetails(notification.notificationType).accentColor,
          }"
          @click="selectNotification(notification)"
        >
          <div class="history-item-heading">
            <strong>{{ notification.title }}</strong>
            <div class="history-item-tags">
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
              <n-tag :type="notification.isRead ? 'default' : 'info'" size="small">
                {{ notification.isRead ? 'خوانده‌شده' : 'خوانده‌نشده' }}
              </n-tag>
            </div>
          </div>
          <n-text depth="3" class="history-item-date">
            {{ new Date(notification.createdAt).toLocaleString() }}
          </n-text>
          <span class="history-item-body">{{ notification.body }}</span>
        </button>
      </div>

      <n-empty
        v-else-if="!notificationStore.historyLoading"
        description="No notifications to display"
        class="history-empty"
      />
    </n-spin>

    <template #footer>
      <div class="pagination-footer">
        <n-button
          size="small"
          :disabled="notificationStore.unreadCount === 0 || notificationStore.markingAllRead"
          :loading="notificationStore.markingAllRead"
          @click="markAllAsRead"
        >
          Mark all as read
        </n-button>

        <n-pagination
          :page="notificationStore.historyPage"
          :page-size="notificationStore.historyPageSize"
          :item-count="notificationStore.historyTotalCount"
          :page-sizes="[10, 20, 50]"
          show-size-picker
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </template>
  </n-card>

  <n-modal
    :show="selectedNotification !== null"
    preset="card"
    :title="selectedNotification?.title ?? 'Notification'"
    style="width: min(520px, 94vw)"
    closable
    @update:show="(show: boolean) => { if (!show) closeDetails() }"
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
</template>

<style scoped>
.history-error {
  margin-bottom: 16px;
}

.notification-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-left: 4px solid transparent;
  border-radius: 6px;
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.history-item:hover,
.history-item.unread {
  background: rgba(128, 128, 128, 0.1);
}

.history-item-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.history-item-tags,
.notification-detail-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.notification-detail-tags {
  margin-bottom: 12px;
}

.history-item-date,
.history-item-body {
  font-size: 13px;
}

.history-item-body {
  white-space: pre-wrap;
}

.history-empty {
  padding: 48px 0;
}

.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.notification-detail-body {
  white-space: pre-wrap;
}
</style>
