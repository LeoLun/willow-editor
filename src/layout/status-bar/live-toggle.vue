<script setup lang="ts">
import { computed } from 'vue';
import { requireInjection } from '@/utils';
import { IToastService, ITreeViewService } from '@/common/const';
import { liveProxyEnabled, setLiveProxyEnabled } from '@/services/live-proxy/store';
import { setServiceWorkerProxyEnabled, syncDirectoryToServiceWorker } from '@/service/sw-client';

const toast = requireInjection(IToastService);
const treeViewService = requireInjection(ITreeViewService);

const enabled = computed(() => liveProxyEnabled.value);

const toggle = async () => {
  const next = !liveProxyEnabled.value;
  setLiveProxyEnabled(next);

  await setServiceWorkerProxyEnabled(next).catch(console.warn);

  if (next) {
    const root = (treeViewService.value as any)?.getRoot?.();
    if (root) {
      await syncDirectoryToServiceWorker(root).catch(console.warn);
      toast.success('Go Live 已开启');
    } else {
      toast.info('Go Live 已开启：请先打开本地文件夹');
    }
  } else {
    toast.info('Go Live 已关闭');
  }
};
</script>

<template>
  <div
    class="go-live"
    :class="{ on: enabled }"
    title="Go Live：开启后可通过 /willow-editor/live... 代理读取本地文件"
    @click="toggle"
  >
    <span class="dot" />
    <span class="label">Go Live</span>
  </div>
</template>

<style lang="less" scoped>
.go-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  margin: 0 3px;
  height: 18px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  color: rgb(255 255 255 / 80%);

  &:hover {
    background: rgb(255 255 255 / 8%);
  }
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(255 255 255 / 35%);
}

.go-live.on {
  color: rgb(255 255 255 / 95%);
}

.go-live.on .dot {
  background: #34d399;
}

.label {
  font-size: 12px;
  line-height: 18px;
}
</style>
