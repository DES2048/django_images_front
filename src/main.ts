import 'vite/modulepreload-polyfill';
import { createApp } from 'vue'
import pinia from './plugins/pinia';
import vuetify from './plugins/vuetify';

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount('#app')
