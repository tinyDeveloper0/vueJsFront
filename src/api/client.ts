import { getConfig } from '@/config'
import { getAccessToken } from '@/auth/session'

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config = getConfig()
  const token = getAccessToken()

  const headers = new Headers(options.headers)

  headers.set('Content-Type', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${config.apiBaseUrl}/${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}
