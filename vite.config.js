import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader' // 👈 加入 SVG loader 插件
import path from 'path'

export default defineConfig({
  // 1. 插件挂载，支持 .vue 文件和 .svg 文件作为组件导入
  plugins: [
    vue(),
    svgLoader(), // 👈 加入这里
  ],

  // 2. 本地开发服务器配置
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '') // 可选
      },
    },
  },

  // 3. 模块解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 4. 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
