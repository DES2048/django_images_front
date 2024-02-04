import 'vite/modulepreload-polyfill';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import 'vuetify/styles'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createVuetify({
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        },
      },
    display: {
        mobileBreakpoint: 'sm'
    }
}))

app.mount('#app')
