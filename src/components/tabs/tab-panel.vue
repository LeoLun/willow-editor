<script setup lang="ts">
import { computed, ref } from 'vue';
import getFileIconLabel from '../file-icon/index';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  unsaved: {
    type: Boolean,
    default: false,
  },
  preview: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'open']);

const clazz = computed(() => ({
  active: props.active,
  preview: props.preview,
}));

const tabHover = ref(false);
const iconHover = ref(false);
enum UnSavedEnum { unsaved, saved }
enum ActiveEnum { active, unactive }
enum TabHoverEnum { hover, unhover }
enum IconHoverEnum { hover, unhover }

const statusMap = {
  [UnSavedEnum[1] + ActiveEnum[0] + TabHoverEnum[0] + IconHoverEnum[0]]: 'close',
  [UnSavedEnum[1] + ActiveEnum[0] + TabHoverEnum[0] + IconHoverEnum[1]]: 'close',
  [UnSavedEnum[1] + ActiveEnum[0] + TabHoverEnum[1] + IconHoverEnum[1]]: 'close',
  [UnSavedEnum[1] + ActiveEnum[1] + TabHoverEnum[0] + IconHoverEnum[0]]: 'close',
  [UnSavedEnum[1] + ActiveEnum[1] + TabHoverEnum[0] + IconHoverEnum[1]]: 'close',
  [UnSavedEnum[1] + ActiveEnum[1] + TabHoverEnum[1] + IconHoverEnum[1]]: 'null',
  [UnSavedEnum[0] + ActiveEnum[0] + TabHoverEnum[0] + IconHoverEnum[0]]: 'close',
  [UnSavedEnum[0] + ActiveEnum[0] + TabHoverEnum[0] + IconHoverEnum[1]]: 'state',
  [UnSavedEnum[0] + ActiveEnum[0] + TabHoverEnum[1] + IconHoverEnum[1]]: 'state',
  [UnSavedEnum[0] + ActiveEnum[1] + TabHoverEnum[0] + IconHoverEnum[0]]: 'close',
  [UnSavedEnum[0] + ActiveEnum[1] + TabHoverEnum[0] + IconHoverEnum[1]]: 'state',
  [UnSavedEnum[0] + ActiveEnum[1] + TabHoverEnum[1] + IconHoverEnum[1]]: 'state',
};

const status = computed(() => {
  const { unsaved, active } = props;
  const unsavedKey = UnSavedEnum[unsaved ? 0 : 1];
  const activeKey = ActiveEnum[active ? 0 : 1];
  const tabHoverKey = TabHoverEnum[tabHover.value ? 0 : 1];
  const iconHoverKey = IconHoverEnum[iconHover.value ? 0 : 1];
  return statusMap[unsavedKey + activeKey + tabHoverKey + iconHoverKey];
});

const icon = computed(() => getFileIconLabel(props.name, false));

const handleTabMouseEnter = () => {
  tabHover.value = true;
};

const handleTabMouseLeave = () => {
  tabHover.value = false;
};

const handleIconMouseEnter = () => {
  iconHover.value = true;
};

const handleIconMouseLeave = () => {
  iconHover.value = false;
};

const handleActionClick = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  if (status.value === 'close') {
    emit('close');
  }
};

const handleClick = () => {
  console.log('open');
  emit('open');
};

</script>
<template>
  <div
    class="w-tab-panel-container"
    :class="clazz"
    @mouseenter="handleTabMouseEnter"
    @mouseleave="handleTabMouseLeave"
    @click="handleClick"
  >
    <div
      class="tab-icon"
      :class="icon"
    />
    <div>{{ name }}</div>
    <div
      class="tab-action"
      @mouseenter="handleIconMouseEnter"
      @mouseleave="handleIconMouseLeave"
      @click.prevent="handleActionClick"
    >
      <SvgIcon
        v-if="status === 'close'"
        size="14"
        name="close"
      />
      <SvgIcon
        v-if="status === 'state'"
        size="12"
        name="round"
      />
    </div>
  </div>
</template>
<style lang="less">
.w-tab-panel-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 10px;
  height: 35px;
  border-right: 1px solid rgb(37 37 38);
  background-color: rgb(48 48 48);
  color: rgb(255 255 255 / 50%);
  cursor: pointer;
  white-space: nowrap;

  &.active {
    background-color: rgb(30 30 30);
    color: rgb(255 255 255);
  }

  &.preview {
    font-style: italic;
  }

  .tab-icon {
    width: 16px;
    padding-right: 6px;
  }

  .tab-action {
    width: 20px;
    height: 20px;
    margin: 0 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;

    &:hover {
      background-color: rgb(90 93 94 / 31%);
    }
  }
}
</style>
