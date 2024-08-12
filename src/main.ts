import './assets/base.css'
import './assets/color.css'

import { FluentBundle } from '@fluent/bundle'
import { createFluentVue } from 'fluent-vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Create bundles for locales that will be used
const enBundle = new FluentBundle('en')
const zhcnBundle = new FluentBundle('zh-cn')

const fluent = createFluentVue({
  bundles: [enBundle, zhcnBundle]
})

app.use(createPinia())
app.use(router)
app.use(fluent)

app.mount('#app')
