import { apiFetch } from './client'
import { apiList } from '@/enums/apiList'
import type {
  AdminNotificationListResponse,
  NotificationActiveResponse,
  NotificationAdminFilter,
  NotificationListResponse,
  NotificationReadReportFilter,
  NotificationReadReportResponse,
  NotificationReadAllResponse,
  NotificationReadResponse,
  NotificationSaveResponse,
  SaveNotificationRequest,
} from '@/types/notification'

export const notificationApi = {
  getNotifications(page: number, perPage: number): Promise<NotificationListResponse> {
    return apiFetch<NotificationListResponse>(apiList.NotificationList, {
      method: 'POST',
      body: JSON.stringify({ page, perPage }),
    })
  },

  getUnreadCount(): Promise<number> {
    return apiFetch<number>(apiList.NotificationUnreadCount, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  markAsRead(notificationId: number): Promise<NotificationReadResponse> {
    return apiFetch<NotificationReadResponse>(`${apiList.NotificationRead}/${notificationId}`, {
      method: 'POST',
    })
  },

  markAllAsRead(): Promise<NotificationReadAllResponse> {
    return apiFetch<NotificationReadAllResponse>(apiList.NotificationReadAll, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  getAdminNotifications(filter: NotificationAdminFilter): Promise<AdminNotificationListResponse> {
    return apiFetch<AdminNotificationListResponse>(apiList.NotificationAdminList, {
      method: 'POST',
      body: JSON.stringify(filter),
    })
  },

  createNotification(payload: SaveNotificationRequest): Promise<NotificationSaveResponse> {
    return apiFetch<NotificationSaveResponse>(apiList.NotificationAdminCreate, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateNotification(
    notificationId: number,
    payload: SaveNotificationRequest,
  ): Promise<NotificationSaveResponse> {
    return apiFetch<NotificationSaveResponse>(
      `${apiList.NotificationAdminUpdate}/${notificationId}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  },

  setNotificationActive(
    notificationId: number,
    isActive: boolean,
  ): Promise<NotificationActiveResponse> {
    return apiFetch<NotificationActiveResponse>(
      `${apiList.NotificationAdminSetActive}/${notificationId}`,
      {
        method: 'POST',
        body: JSON.stringify({ isActive }),
      },
    )
  },

  getReadReport(
    notificationId: number,
    filter: NotificationReadReportFilter,
  ): Promise<NotificationReadReportResponse> {
    return apiFetch<NotificationReadReportResponse>(
      `${apiList.NotificationAdminReadReport}/${notificationId}/ReadReport`,
      {
        method: 'POST',
        body: JSON.stringify(filter),
      },
    )
  },
}
