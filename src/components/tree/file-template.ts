/* eslint-disable @typescript-eslint/no-useless-constructor */
import { TreeEntity } from '@/entity';
import Template from './template';

import getFileIconLabel from '../file-icon/index';

class FileTemplate extends Template {
  /**
   *Creates an instance of FileTemplate.
   * @param {HTMLElement} container
   * @memberof FileTemplate
   */
  constructor(container: HTMLElement) {
    super(container);
  }

  static dispose() {
    // TODO dispose resources?
  }

  /**
   *Set the file
   *
   * @param {TreeEntity} file file node
   * @memberof FileTemplate
   */
  set(file: TreeEntity) {
    // first reset the class name
    this.monacoIconLabel.className = 'monaco-icon-label';
    this.monacoIconLabel.classList.remove('file-icon');

    const icon = getFileIconLabel(file.name, file.isDirectory);
    console.log('icon', icon);
    console.log('');
    console.log('');
    if (!file.isDirectory) {
      this.monacoIconLabel.classList.add('file-icon');
    }

    if (icon) {
      this.monacoIconLabel.classList.add(icon);
    }

    this.label.innerHTML = file.name;
    this.monacoIconLabel.title = file.path;
  }
}
export default FileTemplate;