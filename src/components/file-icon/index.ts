import fileExtensions from './supportedExtensions';
import folderExtensions from './supportedFolders';

export default function getFileIconLabel(_fileName: string, isDirectory = false) {
  const fileName = _fileName.toLowerCase();
  const base = fileName.split('.');
  const ext = base.pop();
  const baseFileName = base.join('.');
  const fileDefault = fileExtensions.default.file;
  const folderDefault = folderExtensions.default.folder;

  if (isDirectory) {
    let folder = folderDefault;
    // 根据文件名字匹配
    const findItem = folderExtensions.supported.find((item) => item.extensions.includes(fileName));
    if (findItem) {
      folder = findItem;
      const { icon } = folder;
      return `folder_type_${icon}`;
    }
    const { icon } = folder;
    return `default_${icon}`;
  }
  let file = fileDefault;
  const findItem = fileExtensions.supported.find((item) => {
    let res = false;
    if (item.filename) {
      // 根据文件名字匹配
      if (item.extensions && item.extensions.length) {
        res = item.extensions.includes(fileName);
      }
    } else if (item.extensions && item.extensions.length && ext) {
      // 根据文件名字匹配
      res = item.extensions.includes(ext);
    }
    if (res) {
      return res;
    }

    // 根据文件名字和后缀匹配
    if (item.filenamesGlob && item.extensionsGlob && ext) {
      if (item.filenamesGlob.includes(baseFileName) && item.extensionsGlob.includes(ext)) {
        return true;
      }
    }
    // 根据文件后缀匹配
    if (item.languages && ext) {
      const currentLang = item.languages.find((lang) => lang.defaultExtension === ext);
      if (currentLang) {
        return true;
      }
    }

    return false;
  });
  if (findItem) {
    file = findItem;
    const { icon } = file;
    return `file_type_${icon}`;
  }
  const { icon } = file;
  return `default_${icon}`;
}
