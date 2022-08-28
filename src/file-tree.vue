<script setup lang="ts">
// import { ref } from 'vue';
import Tree from '@/components/tree/index.vue';
import { DirTreeEntity, FileTreeEntity } from '@/entity/index';

const props = defineProps({
  root: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['open-file']);

const root = props.root as DirTreeEntity;

const handleOpenFile = (item: FileTreeEntity) => {
  emit('open-file', item);
};
</script>
<template>
  <div class="files-tree-container">
    <div class="file-tree-title">
      {{ root.name }}
    </div>
    <div class="file-tree-content">
      <Tree
        :directory="root"
        @open-file="handleOpenFile"
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
