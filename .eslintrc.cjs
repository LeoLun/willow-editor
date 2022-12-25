// const { resolve } = require('path');

module.exports = {
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.vue'],
  },
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
        ],
        extensions: ['.ts', '.js', '.jsx', '.json', '.vue'],
      },
    },
  },
  plugins: [
    '@typescript-eslint',
    'vue',
  ],
  rules: {
    'no-console': 'off',
    'consistent-return': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
  overrides: [
    {
      files: '**/*.vue',
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
    {
      files: ['**/*-worker.ts'],
      rules: {
        'no-restricted-globals': 'off',
      },
    },
  ],
};
