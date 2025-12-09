import vue from '@vitejs/plugin-vue'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { ExternalFluentPlugin, SFCFluentPlugin } from 'unplugin-fluent-vue/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const isStorybookProcess = process.env.npm_lifecycle_event === 'storybook'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // incompatible with Storybook for now
    // https://github.com/storybookjs/storybook/issues/32462
    !isStorybookProcess && vueDevTools(),
    // define messages in SFCs
    SFCFluentPlugin({
      blockType: 'fluent', // default 'fluent' - name of the block in SFCs
      checkSyntax: true // default true - whether to check syntax of the messages
    }),
    // define messages in external ftl files
    ExternalFluentPlugin({
      locales: ['en', 'zh-cn'], // required - list of locales
      checkSyntax: true, // default true - whether to check syntax of the messages

      baseDir: fileURLToPath(new URL('src', import.meta.url)), // base directory for Vue files
      ftlDir: fileURLToPath(new URL('src/locales', import.meta.url)) // directory with ftl files
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url))
    }
  }
})
