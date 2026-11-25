import { defineStore } from 'pinia'
import { ref } from 'vue'

import { notificationApi } from '@/api/notificationApi'
import { notificationRealtime } from '@/services/notificationRealtime'
import type { NotificationItem } from '@/types/notification'

export const useNotificationStore = defineStore('notifications', () => {
  const previewItems = ref<NotificationItem[]>([])
  const historyItems = ref<NotificationItem[]>([])
  const unreadCount = ref(0)
  const historyTotalCount = ref(0)
  const historyPage = ref(1)
  const historyPageSize = ref(10)
  const previewLoading = ref(false)
  const historyLoading = ref(false)
  const markingAllRead = ref(false)
  const error = ref('')
  const realtimeConnected = ref(false)
  const realtimeError = ref('')
  const historyLoaded = ref(false)

  async function loadUnreadCount(): Promise<void> {
    try {
      unreadCount.value = await notificationApi.getUnreadCount()
    } catch (cause) {
      error.value = 'Unable to load unread notification count.'
      console.error(cause)
    }
  }

  async function loadPreview(): Promise<void> {
    previewLoading.value = true
    error.value = ''

    try {
      const response = await notificationApi.getNotifications(1, 5)
      previewItems.value = response.items
    } catch (cause) {
      error.value = 'Unable to load notifications.'
      console.error(cause)
    } finally {
      previewLoading.value = false
    }
  }

  async function loadHistory(page = historyPage.value, perPage = historyPageSize.value): Promise<void> {
    historyPage.value = page
    historyPageSize.value = perPage
    historyLoading.value = true
    error.value = ''

    try {
      const response = await notificationApi.getNotifications(page, perPage)
      historyItems.value = response.items
      historyTotalCount.value = response.totalCount
      historyLoaded.value = true
    } catch (cause) {
      error.value = 'Unable to load notification history.'
      console.error(cause)
    } finally {
      historyLoading.value = false
    }
  }

  async function refresh(): Promise<void> {
    await Promise.all([loadUnreadCount(), loadPreview()])
  }

  async function handleNewNotification(): Promise<void> {
    await refresh()
    if (historyLoaded.value) {
      await loadHistory()
    }
  }

  async function connectRealtime(): Promise<void> {
    try {
      await notificationRealtime.connect(
        () => {
          void handleNewNotification()
        },
        (connected, cause) => {
          realtimeConnected.value = connected
          realtimeError.value = cause?.message ?? ''
          if (connected) {
            void handleNewNotification()
          }
        },
      )
    } catch (cause) {
      realtimeConnected.value = false
      realtimeError.value =
        cause instanceof Error ? cause.message : 'Unable to connect to notification updates.'
      console.error(cause)
    }
  }

  async function disconnectRealtime(): Promise<void> {
    await notificationRealtime.disconnect()
    realtimeConnected.value = false
    realtimeError.value = ''
  }

  async function markAsRead(notificationId: number): Promise<void> {
    const alreadyRead = [...previewItems.value, ...historyItems.value].some(
      (item) => item.id === notificationId && item.isRead,
    )

    try {
      const response = await notificationApi.markAsRead(notificationId)
      const update = (item: NotificationItem) => {
        if (item.id === notificationId) {
          item.isRead = response.isRead
          item.readAt = response.readAt
          item.readAtShamsi = response.readAtShamsi
        }
      }

      previewItems.value.forEach(update)
      historyItems.value.forEach(update)

      if (!alreadyRead && response.isRead) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (cause) {
      error.value = 'Unable to mark the notification as read.'
      console.error(cause)
      throw cause
    }
  }

  async function markAllAsRead(): Promise<void> {
    markingAllRead.value = true
    error.value = ''

    try {
      await notificationApi.markAllAsRead()
      const readAt = new Date().toISOString()
      for (const item of [...previewItems.value, ...historyItems.value]) {
        item.isRead = true
        item.readAt ??= readAt
      }
      unreadCount.value = 0
    } catch (cause) {
      error.value = 'Unable to mark all notifications as read.'
      console.error(cause)
      throw cause
    } finally {
      markingAllRead.value = false
    }
  }

  function clear(): void {
    previewItems.value = []
    historyItems.value = []
    unreadCount.value = 0
    historyTotalCount.value = 0
    historyPage.value = 1
    historyLoaded.value = false
    error.value = ''
  }

  return {
    previewItems,
    historyItems,
    unreadCount,
    historyTotalCount,
    historyPage,
    historyPageSize,
    previewLoading,
    historyLoading,
    markingAllRead,
    error,
    realtimeConnected,
    realtimeError,
    loadUnreadCount,
    loadPreview,
    loadHistory,
    refresh,
    connectRealtime,
    disconnectRealtime,
    markAsRead,
    markAllAsRead,
    clear,
  }
})
