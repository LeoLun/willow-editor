# willow-editor
> 部分功能需要开启 chrome 开启实验性功能 Experimental Web Platform features
## 介绍
willow-editor 是一个在线本地文件编辑器

地址: https://leolun.github.io/willow-editor/

支持
- [x] 打开本地文件夹
- [x] 新建文件/文件夹
- [x] 删除文件/文件夹
- [x] 文件重命名（需要开启 chrome 开启实验性功能 Experimental Web Platform features）
- [] 文件夹重命名（暂无 API 支持）
## 开发
基于 vite + vue3 + less + monaco-editor 开发

文件操作依赖 [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)

其中文件重命名操作依赖 chrome 的非标准 [API提案](https://github.com/whatwg/fs/pull/10)；所以只有在chrome 上并且开启实验性功能才能使用

### 运行
1. 安装依赖
```shell
npm i
```
2. 运行
```shell
npm run dev
```
3. 打开 http://localhost:5173/willow-editor/
### 模块划分
```mermaid
flowchart LR
  subgraph main[主页面]
    direction BT
    subgraph layout
      tree[tree-view]
      tabs[tabs-view]
      editor[editor-view]
      status-bar[status-bar]
      dialog
      menu[content-menu]
    end
    subgraph entity
      node[tree-node-entity]
      file-node[file-tree-node]
      dir-node[dir-tree-node]
      node --> file-node
      node --> dir-node
      file
      tab-node
    end
    file-node --> tree
    dir-node --> tree
    file --> editor
    tab-node --> tabs
  end
  subgraph other[公共]
    direction LR
    utils
    lib
    common
    subgraph components
      direction LR
      button
      dialog
      icon
      input
      toast
      split-pane
    end
  end
  other --> main
```

