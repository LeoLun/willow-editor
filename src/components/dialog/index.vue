<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '标题',
  },
});

const emit = defineEmits(['update:visible']);

const visible = computed({
  get: () => props.visible,
  set: (value) => {
    emit('update:visible', value);
  },
});

const handleClose = () => {
  visible.value = false;
};

</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="visible"
        class="w-dialog"
      >
        <div
          class="w-dialog-container"
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
            <slot />
          </div>
          <div class="w-dialog-footer">
            <slot name="footer" />
          </div>
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
