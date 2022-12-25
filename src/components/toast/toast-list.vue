<script setup lang="ts">
import { ref } from 'vue';
import Toast from './toast.vue';
import type { ToastOptions, ToastItem } from './type';

let key = 0;

const toastList = ref<Array<ToastItem>>([]);

const add = (options: ToastOptions) => {
  toastList.value.push({ key, ...options });
  console.log('duration', options.duration);
  setTimeout(() => {
    const itemKey = key;
    const index = toastList.value.findIndex((item) => item.key === itemKey);
    toastList.value.splice(index, 1);
  }, options.duration + 300);
  key += 1;
};

defineExpose({
  add,
});

</script>
<template>
  <div class="toast-list">
    <TransitionGroup
      name="toast-fade"
    >
      <Toast
        v-for="toast in toastList"
        :key="toast.key"
        :msg="toast.msg"
        :theme="toast.theme"
      />
    </TransitionGroup>
  </div>
</template>
<style lang="less" scoped>
.toast-list {
  position: absolute;
  top: 50px;
  left: 50%;
  z-index: 100;
  transform: translate(-50%);
  display: flex;
  flex-direction: column-reverse;
}

.toast-fade-enter-active {
  animation: toast-fade-in 300ms;
}

.toast-fade-leave-active {
  animation: toast-fade-out 300ms;
}

@keyframes toast-fade-in {
  0% {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }

  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes toast-fade-out {
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
