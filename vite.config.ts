import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Node.js 경로 모듈 가져오기

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @ 기호를 src 폴더의 절대 경로로 매핑
      "@": path.resolve(__dirname, "./src"),
    },
  },
})