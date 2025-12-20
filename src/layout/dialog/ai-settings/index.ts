import { h } from 'vue';
import DialogBase from '@/layout/dialog/dialog-base';
import AiSettings from './ai-settings.vue';

export type PropsOptions = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default class AiSettingsDialog extends DialogBase<PropsOptions> {
  content = () => h(AiSettings, { ...this.props });
}
