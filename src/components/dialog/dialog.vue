<script setup lang="ts">
import { computed } from 'vue';
import SvgIcon from '../svg-icon/index.vue';

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
  foot: {
    type: Function,
    default: null,
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
  emits('update:visible', false);
};

const contentRender = () => {
  const { content } = props;
  return content();
};

const footRender = () => {
  console.log('footRender');
  const { foot } = props;
  return foot && foot();
  // return h('div', {}, {
  //   default: () => {
  //     console.log('33333');
  //     const cancalButton = h('div', {
  //       onClick: () => {
  //         console.log('123');
  //       },
  //     }, '取消');
  //     const confirmButton = h('div', {
  //       onClick: () => {
  //         console.log('321');
  //       },
  //     }, '确定');
  //     return [cancalButton, confirmButton];
  //   },
  // });
};

</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="dialogVisible"
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
            <!-- <slot /> -->
            <contentRender />
          </div>
          <div class="w-dialog-footer">
            <footRender />
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
