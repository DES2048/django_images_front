import 'vite/modulepreload-polyfill';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'

import Vue3TouchEvents from "vue3-touch-events";


import App from './App.vue'
import router from './router'

import './assets/main.css'
import 'vuetify/styles'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vue3TouchEvents);
app.use(createVuetify())

app.mount('#app')
