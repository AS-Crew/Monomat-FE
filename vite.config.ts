import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // sockjs-client가 Node.js 환경의 global 변수를 참조하기 때문에
    // Vite(브라우저) 환경에서도 동작하도록 globalThis로 연결해줍니다.
    global: 'globalThis',
  },
})