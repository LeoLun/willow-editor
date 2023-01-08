/* eslint-disable */
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import type { Position } from '../status-bar/status-bar-types';
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};
const createEditor = (elementId: string) => {
  const editor = monaco.editor.create(document.getElementById(elementId)!, {
    value: '', // 编辑器初始显示文字
    language: 'txt', // 语言支持自行查阅demo
    automaticLayout: true, // 自适应布局
    theme: 'vs-dark', // 官方自带三种主题vs, hc-black, or vs-dark
    foldingStrategy: 'indentation',
    renderLineHighlight: 'all', // 行亮
    selectOnLineNumbers: true, // 显示行号
    minimap: {
      enabled: false,
    },
    readOnly: false, // 只读
    fontSize: 16, // 字体大小
    scrollBeyondLastLine: false, // 取消代码后面一大段空白
    overviewRulerBorder: false, // 不要滚动条的边框
  });

  return editor;
};

export default (
  onChangeCursorPosition: (position: Position) => void,
  onSaveFile: (content: string) => void,
  onChangeFile: (content: string) => void,
  onChangeLanguage: (langguage: string) => void,
) => {
  let monacoEditor: monaco.editor.IStandaloneCodeEditor;

  const getInstance = (elementId: string) => {
    if (monacoEditor) {
      return monacoEditor;
    }

    const editor = createEditor(elementId);
    monacoEditor = editor;

    // eslint-disable-next-line no-bitwise
    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // if (currentFile.value!.handle.kind === 'file') {
      //   writeFile(currentFile.value!.handle, monacoEditor.getValue());
      // }
      onSaveFile(monacoEditor.getValue());
    });

    monacoEditor.onDidChangeModelContent(() => {
      // let value = monacoEditor.getValue()
      // $emit("change", value)
      onChangeFile(monacoEditor.getValue());
    });
    // 显示行列
    monacoEditor.onDidChangeCursorPosition((e) => {
      onChangeCursorPosition({
        column: e.position.column,
        lineNumber: e.position.lineNumber
      })
    });

    monacoEditor.onDidChangeModelLanguage((e) => {
      const languageId = e.newLanguage;
      const language = monaco.languages.getLanguages().find(language => language.id === languageId)
      if (language && language.aliases) {
        onChangeLanguage(language.aliases[0]);
      }
    })

    return monacoEditor;
  };

  // const handleOpenFile = async (tab: TabEntity) => {
  //   if (tab.kind === 'file') {
  //     const match = tab.name.match(/\.[^\.]+$/);
  //     let suffix = match ? match[0] : '';
  //     suffix = findLanguage(suffix);
  //     const content = tab.content;
  //     if (!monacoEditor) {
  //       monacoEditor = initMonaco('monaca-editor');
  //     }
  //     monacoEditor.setValue(content);
  //     const model = monacoEditor.getModel();
  //     if (model) {
  //       monaco.editor.setModelLanguage(model, suffix);
  //     }
  //   }
  // };

  return {
    getInstance
  };
};
