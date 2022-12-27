import SparkMD5 from 'spark-md5';

/** 文件实体类 */
class FileEntity {
  /** 文件唯一标识符 */
  key: string;

  /** 文件名 */
  name: string;

  /** 文件类型 */
  type: 'file' | 'image';

  /** 文件原始 md5 */
  private oldMd5: string = '';

  /** 文件当前 md5 */
  private newMd5: string = '';

  /** 文件内容 */
  private content: string = '';

  /** 文件处理器 */
  private handle: FileSystemFileHandle;

  constructor(
    key: string,
    name: string,
    handle: FileSystemFileHandle,
  ) {
    const ext = name.split('.').pop() || '';
    const isImage = ['jpeg', 'jpg', 'gif', 'png', 'bmp', 'tiff', 'ico', 'webp', 'svg'].includes(ext);
    this.key = key;
    this.name = name;
    this.type = isImage ? 'image' : 'file';
    this.handle = handle;
  }

  /** 获取文本内容 */
  private async fetchTextContent(utfLabel = 'utf-8') {
    const file = await this.handle.getFile();
    const arrayBuffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder(utfLabel);
    return textDecoder.decode(arrayBuffer);
  }

  /** 获取图片内容 */
  private async fetchImageContent() {
    const file = await this.handle.getFile();
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.addEventListener('load', () => {
        resolve(reader.result);
      }, false);

      reader.readAsDataURL(file);
    });
  }

  /** 获取文件内容 */
  getContent() {
    return this.content;
  }

  /** 设置文件内容 */
  setContent(content: string) {
    const md5 = SparkMD5.hash(content);
    this.newMd5 = md5;
    this.content = content;
  }

  /** 是否有修改 */
  isChange() {
    return !(this.newMd5 === this.oldMd5);
  }

  /** 通过 FileSystemFileHandle 获取文件内容 */
  async fetchContent() {
    let content = '';
    if (this.type === 'image') {
      content = await this.fetchImageContent() as string;
    } else {
      content = await this.fetchTextContent();
    }

    const md5 = SparkMD5.hash(content);

    this.content = content;
    this.oldMd5 = md5;
    this.newMd5 = md5;
    return content;
  }

  /**
   * 写入文件到磁盘, 如果没有传入文件内容则写入当前保存的
   * @param content 文件内容
   */
  async write(content?: string) {
    const hasContent = !!content;
    let isChange = this.isChange();
    const saveContent = content || this.content;
    const md5 = SparkMD5.hash(saveContent);

    if (hasContent) {
      isChange = md5 === this.oldMd5;
    }

    if (!isChange) {
      console.log('文件无修改');
      return;
    }

    console.time('writeFile');
    // 写入文件
    const writable = await this.handle.createWritable();
    const textEncoder = new TextEncoder();
    const uint8Array = textEncoder.encode(saveContent);
    await writable.write(uint8Array.buffer);
    await writable.close();
    console.timeEnd('writeFile');

    this.content = saveContent;
    this.oldMd5 = md5;
    this.newMd5 = md5;
  }
}

export default FileEntity;
