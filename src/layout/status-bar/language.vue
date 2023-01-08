<script setup lang="ts">
import { ref } from 'vue';

const language = ref('');

const setLanguage = (value: string) => {
  language.value = value;
};

defineExpose({
  setLanguage,
});

</script>
<template>
  <div
    v-if="language"
    class="language"
  >
    {{ language }}
  </div>
</template>
<style lang="less" scoped>
.language {
  margin: 0 3px;
  padding: 0 5px;
}
</style>
