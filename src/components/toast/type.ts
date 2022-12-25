export type Theme = 'info' | 'success' | 'warning' | 'error';
export type ToastOptions = {
  theme: Theme,
  msg: string,
  duration: number
};

export type ToastItem = {
  key: number,
} & ToastOptions;
