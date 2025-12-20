import { ref } from 'vue';

const STORAGE_KEY = 'willow.liveProxy.enabled';

function loadBool(key: string, fallback = false) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === '1' || v === 'true';
  } catch {
    return fallback;
  }
}

export const liveProxyEnabled = ref<boolean>(loadBool(STORAGE_KEY, false));

export function setLiveProxyEnabled(v: boolean) {
  liveProxyEnabled.value = v;
  try {
    localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
  } catch {
    // ignore
  }
}
