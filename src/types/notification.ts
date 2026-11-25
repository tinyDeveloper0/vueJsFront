import type {
  NotificationPriority,
  NotificationTargetType,
  NotificationType,
} from '@/enums/notification'

export interface NotificationItem {
  id: number
  title: string
  body: string
  notificationType: NotificationType
  priority: NotificationPriority
  createdAt: string
  isRead: boolean
  readAt: string | null
}

export interface NotificationListResponse {
  items: NotificationItem[]
  totalCount: number
}

export interface NotificationReadResponse {
  isRead: boolean
  readAt: string | null
}

export interface NotificationReadAllResponse {
  updatedCount: number
}

export interface NotificationAdminFilter {
  search: string
  notificationType: number | null
  priority: number | null
  targetType: number | null
  isActive: boolean | null
  page: number
  perPage: number
}

export interface AdminNotificationItem {
  id: number
  title: string
  body: string
  notificationType: NotificationType
  priority: NotificationPriority
  targetType: NotificationTargetType
  targetIds: number[]
  createdAt: string
  expiresAt: string | null
  isActive: boolean
  isExpired: boolean
  recipientCount: number
}

export interface AdminNotificationListResponse {
  items: AdminNotificationItem[]
  totalCount: number
}

export interface SaveNotificationRequest {
  title: string
  body: string
  notificationType: NotificationType
  priority: NotificationPriority
  expiresAt: string | null
  targetType: NotificationTargetType
  targetIds: number[]
}

export interface NotificationSaveResponse {
  id: number
  realtimeSent: boolean
}

export interface NotificationReadReportFilter {
  search: string
  isRead: boolean | null
  page: number
  perPage: number
}

export interface NotificationReadReportUser {
  userId: number
  userName: string
  fullName: string
  isRead: boolean
  readAt: string | null
}

export interface NotificationReadReportResponse {
  totalRecipients: number
  readCount: number
  unreadCount: number
  readPercentage: number
  items: NotificationReadReportUser[]
  totalCount: number
}

export interface NotificationActiveResponse {
  isActive: boolean
}
