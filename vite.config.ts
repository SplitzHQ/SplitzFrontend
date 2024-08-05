import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { ExternalFluentPlugin, SFCFluentPlugin } from 'unplugin-fluent-vue/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // define messages in SFCs
    SFCFluentPlugin({
      blockType: 'fluent', // default 'fluent' - name of the block in SFCs
      checkSyntax: true // default true - whether to check syntax of the messages
    }),
    // define messages in external ftl files
    ExternalFluentPlugin({
      locales: ['en', 'zh-cn'], // required - list of locales
      checkSyntax: true, // default true - whether to check syntax of the messages

      baseDir: fileURLToPath(new URL('./src', import.meta.url)), // base directory for Vue files
      ftlDir: fileURLToPath(new URL('./src/locales', import.meta.url)) // directory with ftl files
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
