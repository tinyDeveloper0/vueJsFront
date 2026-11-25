export enum NotificationType {
  Information = 1,
  Warning = 2,
  Important = 3,
}

export enum NotificationPriority {
  Normal = 1,
  Important = 2,
  Critical = 3,
}

export enum NotificationTargetType {
  AllUsers = 1,
  SpecificUsers = 2,
  SpecificRoles = 3,
}

export type NotificationTagType = 'default' | 'info' | 'warning' | 'error'

export function getNotificationTypeDetails(type: number): {
  label: string
  tagType: NotificationTagType
  accentColor: string
} {
  switch (type) {
    case NotificationType.Information:
      return { label: 'اطلاع‌رسانی', tagType: 'info', accentColor: '#2080f0' }
    case NotificationType.Warning:
      return { label: 'هشدار', tagType: 'warning', accentColor: '#f0a020' }
    case NotificationType.Important:
      return { label: 'مهم', tagType: 'error', accentColor: '#d03050' }
    default:
      return { label: 'نامشخص', tagType: 'default', accentColor: '#909399' }
  }
}

export function getNotificationPriorityDetails(priority: number): {
  label: string
  tagType: NotificationTagType
} {
  switch (priority) {
    case NotificationPriority.Normal:
      return { label: 'عادی', tagType: 'default' }
    case NotificationPriority.Important:
      return { label: 'مهم', tagType: 'warning' }
    case NotificationPriority.Critical:
      return { label: 'بحرانی', tagType: 'error' }
    default:
      return { label: 'نامشخص', tagType: 'default' }
  }
}
