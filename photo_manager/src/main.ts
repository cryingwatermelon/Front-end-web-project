import ElementPlus from 'element-plus'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'

import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'
import 'vue3-toastify/dist/index.css'
import App from './App.vue'
import router from './utils/router'

const app = createApp(App)

const store = createPinia().use(piniaPluginPersistedstate)

app.use(store).use(router)
app.use(ElementPlus)
router.isReady().then(() => {
  app.mount('#app')
})
