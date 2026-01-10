<script lang="ts" setup>
import { ref, computed, provide } from 'vue';
import SplitPane from '@/components/split-pane/index.vue';
import { DirTreeEntity } from '@/entity/index';
import AiChat from '@/layout/ai-chat/index.vue';
import { aiChatOpen, aiPanelWidth, setAiPanelWidth } from '@/services/ai/store';
import TopBar from '@/layout/top-bar/index.vue';
import { syncDirectoryToServiceWorker } from '@/service/sw-client';
import { liveProxyEnabled } from '@/services/live-proxy/store';

import {
  IEditorViewService,
  ITreeViewService,
  ITabsViewService,
  IStatusBarService,
} from '@/common/const';

import TreeFactory from '@/lib/tree-factory';
import FileTree from '@/layout/tree-view/index.vue';
import FileEditor from '@/layout/editor-view/index.vue';
import FileTabs from '@/layout/tabs-view/index.vue';
import StatusBar from '@/layout/status-bar/index.vue';

const root = ref<DirTreeEntity>();
const editorViewService = ref<InstanceType<typeof FileEditor>>(null as any);
const treeViewService = ref<InstanceType<typeof FileTree>>(null as any);
const tabsViewService = ref<InstanceType<typeof FileTabs>>(null as any);
const statusBarService = ref<InstanceType<typeof StatusBar>>(null as any);

provide(IEditorViewService, editorViewService);
provide(ITreeViewService, treeViewService);
provide(ITabsViewService, tabsViewService);
provide(IStatusBarService, statusBarService);

const isDrag = ref(false);
const dragTitle = ref('拖拽文件夹 或 点击选择文件夹');

const isEmpty = computed(() => !root.value);
const chatOpen = computed(() => aiChatOpen.value);

const AI_PANEL_MIN_WIDTH = 280;
const AI_PANEL_MAX_WIDTH = 720;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const onMainSplitResize = (payload: any) => {
  // 两栏模式 emit number；三栏模式 emit object（我们只关心右侧 pane 的宽度）
  if (!payload || typeof payload !== 'object') return;
  if (!chatOpen.value) return;
  const containerPx = Number(payload.containerPx);
  const rightPercent = Number(payload.rightPercent);
  if (!Number.isFinite(containerPx) || !Number.isFinite(rightPercent) || containerPx <= 0) return;
  const rightPx = Math.round((rightPercent / 100) * containerPx);
  setAiPanelWidth(clamp(rightPx, AI_PANEL_MIN_WIDTH, AI_PANEL_MAX_WIDTH));
};

const handeleShowDirectoryPicker = async () => {
  root.value = await TreeFactory.createTree();
  if (root.value && liveProxyEnabled.value) {
    // 把文件句柄映射同步到 SW，供 /willow-editor/live/... 代理读取本地文件
    syncDirectoryToServiceWorker(root.value).catch(console.warn);
  }
};

const handleDragover = () => {
  isDrag.value = true;
  dragTitle.value = '松开鼠标';
};

const handleDrop = async (e: DragEvent) => {
  if (e.dataTransfer && e.dataTransfer.items) {
    const items = e.dataTransfer.items as any;
    const fileHandlesPromises = [...items]
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFileSystemHandle());

    // eslint-disable-next-line no-restricted-syntax
    for await (const handle of fileHandlesPromises) {
      if (handle.kind === 'directory') {
        root.value = await TreeFactory.createTreeByHandle(handle);
        if (root.value && liveProxyEnabled.value) {
          syncDirectoryToServiceWorker(root.value).catch(console.warn);
        }
      }
    }
  }
};

const handleDragleave = () => {
  isDrag.value = false;
  dragTitle.value = '拖拽文件夹 或 点击选择文件夹';
};

</script>

<template>
  <div class="editor-container">
    <div
      v-if="isEmpty"
      class="emtpy-content"
      :class="{'is-drag': isDrag}"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragover"
      @dragleave.prevent="handleDragleave"
      @click="handeleShowDirectoryPicker"
    >
      {{ dragTitle }}
    </div>
    <div
      v-else
      class="base-content"
    >
      <TopBar />
      <div class="main-content">
        <split-pane
          v-if="chatOpen"
          three
          :min-percent="10"
          :max-percent="40"
          :default-percent="15"
          :default-right-px="aiPanelWidth"
          :min-right-px="280"
          :max-right-px="720"
          split="vertical"
          @resize="onMainSplitResize"
        >
          <template #pane-l>
            <FileTree
              ref="treeViewService"
              class="dir-tree"
              :root="root"
            />
          </template>
          <template #pane-m>
            <div class="editor-content">
              <FileTabs
                ref="tabsViewService"
                class="editor-tabs-container"
              />
              <FileEditor
                ref="editorViewService"
                class="editor-view-container"
              />
              <div class="w-background">
                <img
                  class="w-background-image"
                  src="@/assets/logo.svg"
                >
                <!-- <div>打开 功能介绍</div> -->
              </div>
            </div>
          </template>
          <template #pane-r>
            <AiChat />
          </template>
        </split-pane>

        <split-pane
          v-else
          :min-percent="10"
          :max-percent="40"
          :default-percent="15"
          split="vertical"
        >
          <template #pane-l>
            <FileTree
              ref="treeViewService"
              class="dir-tree"
              :root="root"
            />
          </template>
          <template #pane-r>
            <div class="editor-content">
              <FileTabs
                ref="tabsViewService"
                class="editor-tabs-container"
              />
              <FileEditor
                ref="editorViewService"
                class="editor-view-container"
              />
              <div class="w-background">
                <img
                  class="w-background-image"
                  src="@/assets/logo.svg"
                >
                <!-- <div>打开 功能介绍</div> -->
              </div>
            </div>
          </template>
        </split-pane>
      </div>
      <StatusBar ref="statusBarService" />
    </div>
  </div>
</template>

<style lang="less">
@import url("./components/file-icon/icons.css");

.editor-container {
  display: flex;
  flex-direction: row;
  background: var(--w-background);
  color: var(--w-text-color);
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.editor-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.editor-tabs-container {
  position: relative;
  height: 35px;
  z-index: 1;
}

.editor-view-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
}

.base-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.main-content {
  flex: 1;
  min-height: 0;
}

.dir-tree {
  width: 100%;
  height: 100%;
}

.emtpy-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 500px;
  height: 300px;
  border-radius: 5px;
  border: 1px dashed var(--w-border-color);

  &.is-drag {
    border-color: #db8742;
    color: #db8742;
  }
}

.w-background {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  z-index: 0;
  top: 0;
  left: 0;
}

.w-background-image {
  width: 250px;
  filter: grayscale(1);
  opacity: 0.1;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
