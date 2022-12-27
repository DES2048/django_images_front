import 'vite/modulepreload-polyfill';
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import 'simplebar/dist/simplebar.min.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
