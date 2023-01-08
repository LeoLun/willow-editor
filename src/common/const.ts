import type { InjectionKey, Ref } from 'vue';
import type Toast from '@/components/toast/index';
import type Dialog from '@/components/dialog/index';
import type FileTree from '@/layout/tree-view/index.vue';
import type FileEditor from '@/layout/editor-view/index.vue';
import type FileTabs from '@/layout/tabs-view/index.vue';
import type StatusBar from '@/layout/status-bar/index.vue';

export const IEditorViewService = Symbol('IEditorViewService') as InjectionKey<Ref<InstanceType<typeof FileEditor>>>;
export const ITreeViewService = Symbol('ITreeViewService') as InjectionKey<Ref<InstanceType<typeof FileTree>>>;
export const ITabsViewService = Symbol('ITabsViewService') as InjectionKey<Ref<InstanceType<typeof FileTabs>>>;
export const IStatusBarService = Symbol('ITabsViewService') as InjectionKey<Ref<InstanceType<typeof StatusBar>>>;

export const IToastService = Symbol('IToastService') as InjectionKey<typeof Toast>;
export const IDialogService = Symbol('IToastService') as InjectionKey<typeof Dialog>;
