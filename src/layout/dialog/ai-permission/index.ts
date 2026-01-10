import { h } from 'vue';
import DialogBase from '@/layout/dialog/dialog-base';
import AiPermission from './ai-permission.vue';

export type PropsOptions = {
  title?: string;
  permission: string;
  pattern: string;
  onAllow: (remember: boolean) => void;
  onDeny: (remember: boolean) => void;
  onCancel: () => void;
};

export default class AiPermissionDialog extends DialogBase<PropsOptions> {
  content = () => h(AiPermission, { ...this.props });
}
