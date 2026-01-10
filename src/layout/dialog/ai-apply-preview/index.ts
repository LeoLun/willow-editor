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
  constructor(props: PropsOptions) {
    super(props, {
      // 更大、更接近全屏的预览尺寸
      containerStyle: {
        width: 'min(96vw, 1200px)',
        top: '6vh',
      },
    });
  }

  content = () => h(AiApplyPreview, { ...this.props });
}
