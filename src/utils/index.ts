import { inject, InjectionKey } from 'vue';

// eslint-disable-next-line import/prefer-default-export
export function requireInjection<T>(key: InjectionKey<T>, defaultValue?: T) {
  const resolved = inject(key, defaultValue);
  if (!resolved) {
    throw new Error(`${key} was not provided.`);
  }
  return resolved;
}
