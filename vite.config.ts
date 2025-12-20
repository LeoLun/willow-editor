import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';
import stylelint from 'vite-plugin-stylelint';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { nativeSW } from './plugin/sw.plugin';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // 注意：vite-plugin-eslint/stylelint 在某些受限环境（如沙箱）可能触发权限问题；
  // 这里只在 dev serve 时启用，避免影响生产构建。
  const enableLint = command === 'serve';

  return {
    base: '/weditor/',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [
      enableLint
        ? eslint({
          cache: false,
        })
        : null,
      enableLint
        ? stylelint({
          cache: false,
        })
        : null,
      vue(),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve(__dirname, 'src/assets/svg-sprites')],
        // 指定symbolId格式
        symbolId: 'icon-[dir]-[name]',
        inject: 'body-last',
        customDomId: '__svg__icons__dom__',
      }),
      nativeSW({
        entries: [{
          src: resolve(__dirname, 'src/service/index.worker.ts'),
          dist: 'sw.js',
        }],
      }),
    ].filter(Boolean),
  };
});
