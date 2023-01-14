<script setup lang="ts">
// import { ref } from 'vue';
import { DirTreeEntity } from '@/entity/index';
import Tree from './tree/index.vue';

const props = defineProps({
  root: {
    type: Object,
    default: null,
  },
});

const root = props.root as DirTreeEntity;

</script>
<template>
  <div class="files-tree-container">
    <div class="file-tree-title">
      {{ root.name }}
    </div>
    <div class="file-tree-content">
      <Tree
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
