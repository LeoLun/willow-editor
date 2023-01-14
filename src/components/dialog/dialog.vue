<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '标题',
  },
  content: {
    type: Function,
    required: true,
  },
});

const emits = defineEmits(['update:visible']);

const dialogVisible = computed({
  get: () => props.visible,
  set: (nValue) => {
    emits('update:visible', nValue);
  },
});

const handleClose = () => {
  console.log('handleClose');
  emits('update:visible', false);
};

const contentRender = () => {
  const { content } = props;
  return content();
};

</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="dialogVisible"
        class="w-dialog"
      >
        <div class="w-dialog-container">
          <contentRender @close="handleClose" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="less" scoped>
.w-dialog {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.w-dialog-container {
  position: absolute;
  left: 50%;
  top: 20%;
  width: 600px;
  transform: translateX(-50%);
  padding: 16px;
  background: #fff;
  background-color: rgb(37 37 38);
  color: rgb(204 204 204);
  box-shadow: rgb(0 0 0 / 36%) 0 0 8px 2px;
}

.dialog-fade-enter-active {
  animation: dialog-fade-in 300ms;
}

.dialog-fade-leave-active {
  animation: dialog-fade-out 300ms;
}

@keyframes dialog-fade-in {
  0% {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }

  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes dialog-fade-out {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }

  100% {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }
}

</style>
