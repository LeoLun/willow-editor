import type { InjectionKey, Ref } from 'vue';
import FileTree from './views/tree-view/index.vue';
import FileEditor from './views/editor-view/index.vue';
import FileTabs from './views/tabs-view/index.vue';

export const IEditorViewService = Symbol('IEditorViewService') as InjectionKey<Ref<InstanceType<typeof FileEditor>>>;
export const ITreeViewService = Symbol('ITreeViewService') as InjectionKey<Ref<InstanceType<typeof FileTree>>>;
export const ITabsViewService = Symbol('ITabsViewService') as InjectionKey<Ref<InstanceType<typeof FileTabs>>>;
