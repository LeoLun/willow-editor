<script setup lang="ts">
import SvgIcon from '@/components/svg-icon/index.vue';
import { computed } from 'vue';

const props = defineProps<{
  title: string
}>();

const title = computed(() => props.title);

interface EmitsType {
  (e: 'close'): void
}

const emits = defineEmits<EmitsType>();

const handleClose = () => {
  emits('close');
};

</script>
<template>
  <div
    class="w-dialog-base-container "
  >
    <div class="w-dialog-header">
      <div>{{ title }}</div>
      <div
        class="w-dialog-close"
        @click="handleClose"
      >
        <SvgIcon
          size="14"
          name="close"
        />
      </div>
    </div>
    <div class="w-dialog-content">
      <slot @close="handleClose" />
    </div>
    <div class="w-dialog-footer">
      <slot
        name="footer"
        @close="handleClose"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.w-dialog-base-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.w-dialog-header {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  margin-bottom: 16px;
  height: 22px;
  line-height: 22px;
}

.w-dialog-content {
  margin-bottom: 16px;
}

.w-dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: end;

  :deep(.w-button + .w-button) {
    margin-left: 10px;
  }
}

.w-dialog-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  cursor: pointer;
  border-radius: 5px;

  &:hover {
    background-color: rgb(90 93 94 / 31%) !important;
  }
}
</style>
