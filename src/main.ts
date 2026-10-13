import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { loadConfig } from './config'

async function bootstrap() {
  await loadConfig()

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

bootstrap()
