import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr'

import { getConfig } from '@/config'
import { getAccessToken } from '@/auth/session'

type NotificationHandler = (notificationId: number) => void
type ConnectionStatusHandler = (connected: boolean, error?: Error) => void

class NotificationRealtimeService {
  private connection: HubConnection | null = null
  private shouldConnect = false
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private notificationHandler: NotificationHandler | null = null
  private statusHandler: ConnectionStatusHandler | null = null

  async connect(
    notificationHandler: NotificationHandler,
    statusHandler: ConnectionStatusHandler,
  ): Promise<void> {
    this.shouldConnect = true
    this.notificationHandler = notificationHandler
    this.statusHandler = statusHandler

    if (!this.connection) {
      const baseUrl = getConfig().apiBaseUrl.replace(/\/+$/, '')
      this.connection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/notifications`, {
          accessTokenFactory: () => getAccessToken() ?? '',
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build()

      this.connection.on('NewNotification', (notificationId: number) => {
        this.notificationHandler?.(notificationId)
      })
      this.connection.onreconnecting((error) => {
        this.statusHandler?.(false, error)
      })
      this.connection.onreconnected(() => {
        this.statusHandler?.(true)
      })
      this.connection.onclose((error) => {
        this.statusHandler?.(false, error)
        if (this.shouldConnect) this.scheduleReconnect()
      })
    }

    if (this.connection.state === HubConnectionState.Connected) return
    if (this.connection.state !== HubConnectionState.Disconnected) return

    try {
      await this.connection.start()
      this.statusHandler?.(true)
    } catch (error) {
      const connectionError =
        error instanceof Error ? error : new Error('Unable to connect to notifications.')
      this.statusHandler?.(false, connectionError)
      this.scheduleReconnect()
      throw connectionError
    }
  }

  async disconnect(): Promise<void> {
    this.shouldConnect = false
    this.notificationHandler = null
    this.statusHandler = null

    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }

    if (this.connection) {
      await this.connection.stop()
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldConnect || this.retryTimer) return

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      if (!this.shouldConnect || !this.connection) return
      if (this.connection.state !== HubConnectionState.Disconnected) return

      void this.connection.start().then(
        () => this.statusHandler?.(true),
        (error: unknown) => {
          this.statusHandler?.(
            false,
            error instanceof Error ? error : new Error('Unable to reconnect to notifications.'),
          )
          this.scheduleReconnect()
        },
      )
    }, 5000)
  }
}

export const notificationRealtime = new NotificationRealtimeService()
