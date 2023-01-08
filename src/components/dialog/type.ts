export type DialogOptions = {
  title: string,
  content: () => any,
  foot?: () => any,
};

export interface DialogInstance {
  instance: any;

  /**
   * 销毁弹框
   */
  destroy: () => void;
  /**
   * 隐藏弹框
   */
  hide: () => void;
  /**
   * 显示弹框
   */
  show: () => void;
  /**
   * 更新弹框内容
   */
  update: (props: DialogOptions) => void;
}
