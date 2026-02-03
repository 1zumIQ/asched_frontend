import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    try {
      await worker.start({ onUnhandledRequest: 'bypass' })
    } catch (error) {
      console.warn('MSW failed to start. Run `npx msw init public/` to generate the worker file.', error)
    }
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

void bootstrap()
