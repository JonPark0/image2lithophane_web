import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages 배포 설정
  base: '/image2lithophane_web/',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 청크 크기 경고 제한을 늘림 (Three.js가 큼)
    chunkSizeWarningLimit: 1000,
  },

  server: {
    port: 3000,
    open: true
  }
})
