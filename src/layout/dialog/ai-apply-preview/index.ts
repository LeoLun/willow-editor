import { h } from 'vue';
import DialogBase from '@/layout/dialog/dialog-base';
import AiApplyPreview from './ai-apply-preview.vue';
import type { PreviewFile } from './ai-apply-preview.vue';

export type PropsOptions = {
  files: PreviewFile[];
  onCancel: () => void;
  onConfirm: () => void;
};

export default class AiApplyPreviewDialog extends DialogBase<PropsOptions> {
  content = () => h(AiApplyPreview, { ...this.props });
}
