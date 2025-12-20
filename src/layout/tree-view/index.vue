<script setup lang="ts">
import { computed, ref } from 'vue';
import { DirTreeEntity } from '@/entity/index';
import Tree from './tree/index.vue';

const props = defineProps({
  root: {
    type: Object,
    default: null,
  },
});

const root = computed(() => props.root as DirTreeEntity);

const treeRef = ref<InstanceType<typeof Tree>>();

const getRoot = () => root.value;
const refresh = () => (treeRef.value as any)?.refresh?.();

defineExpose({
  getRoot,
  refresh,
});

</script>
<template>
  <div class="files-tree-container">
    <div class="file-tree-title">
      {{ root?.name }}
    </div>
    <div class="file-tree-content">
      <Tree
        ref="treeRef"
        :directory="root"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.files-tree-container {
  display: flex;
  flex-direction: column;
  background: #1d1d1d;
  color: #fff;
}

.file-tree-title {
  font-size: 18px;
  margin: 16px 0;
}

.file-tree-content {
  flex: 1;
}

</style>
