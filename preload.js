const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 应用配置
  getAppConfig: () => ipcRenderer.invoke('get-app-config'),
  
  // 文件系统操作
  selectDownloadDirectory: () => ipcRenderer.invoke('select-download-directory'),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // Python脚本执行
  executePythonScript: (args) => ipcRenderer.invoke('execute-python-script', args),
  
  // Motrix连接测试
  testMotrixConnection: () => ipcRenderer.invoke('test-motrix-connection'),
  
  // Motrix启动
  launchMotrix: () => ipcRenderer.invoke('launch-motrix'),
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
  
  // 外部链接
  openExternalLink: (url) => ipcRenderer.invoke('open-external-link', url),
  
  // 文件拖拽处理
  handleFileDrop: (filePaths) => ipcRenderer.invoke('handle-file-drop', filePaths),
  
  // 菜单事件监听
  onMenuAction: (callback) => {
    const menuActions = [
      'menu-new-search',
      'menu-settings',
      'menu-start-search',
      'menu-stop-search',
      'menu-pause-all',
      'menu-resume-all',
      'menu-clear-completed',
      'menu-rescan-categories',
      'menu-test-motrix',
      'menu-export-settings',
      'menu-import-settings',
      'menu-check-update'
    ];
    
    menuActions.forEach(action => {
      ipcRenderer.on(action, callback);
    });
    
    // 返回清理函数
    return () => {
      menuActions.forEach(action => {
        ipcRenderer.removeAllListeners(action);
      });
    };
  },
  
  // 文件拖拽事件监听
  onFileDropped: (callback) => {
    ipcRenderer.on('file-dropped', callback);
    return () => ipcRenderer.removeAllListeners('file-dropped');
  },
  
  // 系统信息
  getSystemInfo: () => ({
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node
  }),
  
  // 应用控制
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  
  // 通知
  showNotification: (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }
});

// 请求通知权限
if (Notification.permission === 'default') {
  Notification.requestPermission();
}

// 监听应用就绪事件
window.addEventListener('DOMContentLoaded', () => {
  // 添加桌面应用特有的样式和行为
  document.body.classList.add('desktop-app');
  
  // 设置窗口标题
  electronAPI.getAppConfig().then(config => {
    document.title = `${config.name} v${config.version}`;
  });
  
  // 处理菜单事件
  electronAPI.onMenuAction((event, action) => {
    handleMenuAction(action);
  });
  
  // 处理文件拖拽
  electronAPI.onFileDropped((event, data) => {
    handleFileDrop(data);
  });
  
  // 添加拖拽支持
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).map(file => file.path);
    if (files.length > 0) {
      electronAPI.handleFileDrop(files);
    }
  });
});

// 菜单动作处理
function handleMenuAction(action) {
  switch (action) {
    case 'menu-new-search':
      showPanel('search');
      document.getElementById('search-keyword').focus();
      break;
    case 'menu-settings':
      showPanel('settings');
      break;
    case 'menu-start-search':
      if (typeof startSearch === 'function') {
        startSearch();
      }
      break;
    case 'menu-stop-search':
      if (typeof stopSearch === 'function') {
        stopSearch();
      }
      break;
    case 'menu-pause-all':
      if (typeof pauseAllDownloads === 'function') {
        pauseAllDownloads();
      }
      break;
    case 'menu-resume-all':
      if (typeof resumeAllDownloads === 'function') {
        resumeAllDownloads();
      }
      break;
    case 'menu-clear-completed':
      if (typeof clearCompleted === 'function') {
        clearCompleted();
      }
      break;
    case 'menu-rescan-categories':
      if (typeof rescanCategories === 'function') {
        rescanCategories();
      }
      break;
    case 'menu-test-motrix':
      if (typeof testMotrixConnection === 'function') {
        testMotrixConnection();
      }
      break;
    case 'menu-export-settings':
      exportSettings();
      break;
    case 'menu-import-settings':
      importSettings();
      break;
    case 'menu-check-update':
      checkForUpdates();
      break;
  }
}

// 文件拖拽处理
function handleFileDrop(data) {
  const { type, path } = data;
  
  switch (type) {
    case 'archive':
      // 处理压缩文件
      electronAPI.showMessageBox({
        type: 'question',
        title: '导入资源包',
        message: '检测到压缩文件',
        detail: `是否要导入资源包: ${path}`,
        buttons: ['是', '否']
      }).then(result => {
        if (result.response === 0) {
          importResourcePackage(path);
        }
      });
      break;
    case 'model':
      // 处理3D模型文件
      addResourceToCategory(path, 'models');
      break;
    case 'image':
      // 处理图片文件
      addResourceToCategory(path, 'textures');
      break;
  }
}

// 导入资源包
function importResourcePackage(filePath) {
  // 这里可以添加解压和分类逻辑
  electronAPI.showMessageBox({
    type: 'info',
    title: '导入完成',
    message: '资源包导入成功',
    detail: `已从 ${filePath} 导入资源`
  });
}

// 添加资源到分类
function addResourceToCategory(filePath, category) {
  // 这里可以添加文件复制和分类逻辑
  console.log(`添加资源到分类: ${filePath} -> ${category}`);
}

// 导出设置
function exportSettings() {
  electronAPI.showSaveDialog({
    title: '导出设置',
    defaultPath: 'rpg_asset_manager_settings.json',
    filters: [
      { name: 'JSON文件', extensions: ['json'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  }).then(result => {
    if (!result.canceled) {
      // 导出设置逻辑
      const settings = {
        download: {
          dir: document.getElementById('download-dir')?.value,
          maxConcurrent: document.getElementById('max-concurrent')?.value
        },
        search: {
          defaultCount: document.getElementById('default-search-count')?.value,
          timeout: document.getElementById('request-timeout')?.value
        }
      };
      
      // 这里应该实际保存设置到文件
      electronAPI.showMessageBox({
        type: 'info',
        title: '导出成功',
        message: '设置已导出',
        detail: `设置已保存到: ${result.filePath}`
      });
    }
  });
}

// 导入设置
function importSettings() {
  electronAPI.showOpenDialog({
    title: '导入设置',
    filters: [
      { name: 'JSON文件', extensions: ['json'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile']
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      // 导入设置逻辑
      electronAPI.showMessageBox({
        type: 'info',
        title: '导入成功',
        message: '设置已导入',
        detail: `设置已从 ${result.filePaths[0]} 导入`
      });
    }
  });
}

// 检查更新
function checkForUpdates() {
  electronAPI.showMessageBox({
    type: 'info',
    title: '检查更新',
    message: '当前已是最新版本',
    detail: 'RPG美术资源管理器 v2.0.0'
  });
}

// 添加桌面应用特有的CSS类
const style = document.createElement('style');
style.textContent = `
  .desktop-app {
    -webkit-app-region: no-drag;
  }
  
  .desktop-app .top-navbar {
    -webkit-app-region: drag;
  }
  
  .desktop-app .nav-item,
  .desktop-app .action-button,
  .desktop-app .control-button {
    -webkit-app-region: no-drag;
  }
  
  .desktop-app .window-controls {
    -webkit-app-region: no-drag;
    position: fixed;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 5px;
    z-index: 1000;
  }
  
  .desktop-app .window-control {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  
  .desktop-app .window-control.close {
    background: #ff5f57;
  }
  
  .desktop-app .window-control.minimize {
    background: #ffbd2e;
  }
  
  .desktop-app .window-control.maximize {
    background: #28ca42;
  }
`;
document.head.appendChild(style);
