import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';
import stylelint from 'vite-plugin-stylelint';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/willow-editor/',
  build: {
    outDir: 'docs',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    eslint({
      cache: false,
    }),
    stylelint({
      cache: false,
    }),
    vue(),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [resolve(__dirname, 'src/assets/svg-sprites')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      customDomId: '__svg__icons__dom__',
    }),
  ],
});
