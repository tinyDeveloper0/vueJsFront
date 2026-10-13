export interface AppConfig {
  apiBaseUrl: string
}

let config: AppConfig | null = null

export async function loadConfig(): Promise<void> {
  const response = await fetch('/config.json', {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Unable to load application configuration: ${response.status}`)
  }

  config = await response.json()
}

export function getConfig(): AppConfig {
  if (!config) {
    throw new Error('Application configuration has not been loaded.')
  }

  return config
}
