const { app, BrowserWindow, Menu, ipcMain, dialog, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');

// 保持对窗口对象的全局引用
let mainWindow;
let pythonProcess;

// 应用配置
const APP_CONFIG = {
  name: 'RPG美术资源管理器',
  version: '2.0.0',
  downloadDir: path.join(process.env.USERPROFILE || process.env.HOME, 'XJ', 'rpg_assets'),
  pythonScript: path.join(__dirname, 'cc0_asset_automation_system.py'),
  motrixConfig: {
    host: '127.0.0.1',
    port: 16800,
    token: 'a2HrlXF2L18b'
  }
};

// 创建主窗口
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: getAppIcon(),
    titleBarStyle: 'default',
    show: false, // 先不显示，等加载完成后再显示
    title: APP_CONFIG.name + ' v' + APP_CONFIG.version
  });

  // 加载应用界面
  mainWindow.loadFile('rpg_asset_manager_ui.html');

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 开发模式下打开开发者工具
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 当窗口被关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 创建应用菜单
  createMenu();
}

// 获取应用图标
function getAppIcon() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath);
  }
  return null;
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建搜索',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-search');
          }
        },
        {
          label: '打开下载目录',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            shell.openPath(APP_CONFIG.downloadDir);
          }
        },
        { type: 'separator' },
        {
          label: '设置',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-settings');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectall', label: '全选' }
      ]
    },
    {
      label: '搜索',
      submenu: [
        {
          label: '开始搜索',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            mainWindow.webContents.send('menu-start-search');
          }
        },
        {
          label: '停止搜索',
          accelerator: 'Escape',
          click: () => {
            mainWindow.webContents.send('menu-stop-search');
          }
        }
      ]
    },
    {
      label: '下载',
      submenu: [
        {
          label: '暂停全部下载',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            mainWindow.webContents.send('menu-pause-all');
          }
        },
        {
          label: '继续全部下载',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.send('menu-resume-all');
          }
        },
        { type: 'separator' },
        {
          label: '清空已完成',
          click: () => {
            mainWindow.webContents.send('menu-clear-completed');
          }
        }
      ]
    },
    {
      label: '工具',
      submenu: [
        {
          label: '重新扫描分类',
          click: () => {
            mainWindow.webContents.send('menu-rescan-categories');
          }
        },
        {
          label: '测试Motrix连接',
          click: () => {
            mainWindow.webContents.send('menu-test-motrix');
          }
        },
        { type: 'separator' },
        {
          label: '导出设置',
          click: () => {
            mainWindow.webContents.send('menu-export-settings');
          }
        },
        {
          label: '导入设置',
          click: () => {
            mainWindow.webContents.send('menu-import-settings');
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: APP_CONFIG.name,
              detail: `版本: ${APP_CONFIG.version}\n\n一个专业的RPG游戏美术资源自动化管理工具，支持多平台搜索、智能分类和批量下载。\n\n© 2024 RPG Asset Manager Team`
            });
          }
        },
        {
          label: '使用说明',
          click: () => {
            shell.openExternal('https://github.com/rpg-asset-manager/desktop-app/wiki');
          }
        },
        { type: 'separator' },
        {
          label: '检查更新',
          click: () => {
            mainWindow.webContents.send('menu-check-update');
          }
        }
      ]
    }
  ];

  // macOS特殊处理
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: '关于' },
        { type: 'separator' },
        { role: 'services', label: '服务' },
        { type: 'separator' },
        { role: 'hide', label: '隐藏' },
        { role: 'hideothers', label: '隐藏其他' },
        { role: 'unhide', label: '显示全部' },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 初始化应用
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用即将退出时清理资源
app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

// IPC通信处理
ipcMain.handle('get-app-config', () => {
  return APP_CONFIG;
});

ipcMain.handle('select-download-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    defaultPath: APP_CONFIG.downloadDir
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    APP_CONFIG.downloadDir = result.filePaths[0];
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('launch-motrix', async () => {
  try {
    console.log('正在启动Motrix...');
    
    // 常见的Motrix安装路径
    const motrixPaths = [
      'C:\\Program Files\\Motrix\\Motrix.exe',
      'C:\\Program Files (x86)\\Motrix\\Motrix.exe',
      path.join(process.env.APPDATA, 'Motrix', 'Motrix.exe'),
      path.join(process.env.LOCALAPPDATA, 'Programs', 'Motrix', 'Motrix.exe'),
      path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Programs', 'Motrix', 'Motrix.exe'),
      path.join(process.env.USERPROFILE, 'AppData', 'Roaming', 'Motrix', 'Motrix.exe')
    ];
    
    // 尝试启动Motrix
    for (const motrixPath of motrixPaths) {
      try {
        if (fs.existsSync(motrixPath)) {
          console.log('找到Motrix:', motrixPath);
          
          // 启动Motrix进程
          const motrixProcess = spawn(motrixPath, [], {
            detached: true,
            stdio: 'ignore'
          });
          
          motrixProcess.unref();
          
          console.log('Motrix启动成功');
          return { success: true, path: motrixPath };
        }
      } catch (error) {
        console.log('尝试启动Motrix失败:', motrixPath, error.message);
      }
    }
    
    // 如果找不到Motrix，尝试通过系统默认方式启动
    try {
      await shell.openExternal('motrix://');
      console.log('通过系统默认方式启动Motrix');
      return { success: true, method: 'system' };
    } catch (error) {
      console.error('系统默认启动失败:', error);
    }
    
    return { success: false, error: '未找到Motrix安装路径' };
    
  } catch (error) {
    console.error('启动Motrix失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('execute-command', async (event, command) => {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const { stdout, stderr } = await execAsync(command);
    return { success: true, stdout, stderr };
  } catch (error) {
    console.error('执行命令失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('execute-python-script', async (event, args) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(APP_CONFIG.pythonScript)) {
      reject(new Error('Python脚本文件不存在'));
      return;
    }

    const pythonArgs = [APP_CONFIG.pythonScript, ...args];
    pythonProcess = spawn('python', pythonArgs, {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Python脚本执行失败，退出码: ${code}\n${stderr}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`启动Python进程失败: ${error.message}`));
    });
  });
});

ipcMain.handle('test-motrix-connection', async () => {
  try {
    const axios = require('axios');
    const response = await axios.post(`http://${APP_CONFIG.motrixConfig.host}:${APP_CONFIG.motrixConfig.port}/jsonrpc`, {
      jsonrpc: '2.0',
      method: 'aria2.getVersion',
      id: 'test'
    }, {
      headers: {
        'Authorization': `token ${APP_CONFIG.motrixConfig.token}`
      },
      timeout: 5000
    });
    
    return { success: true, version: response.data.result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-external-link', async (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// 处理文件拖拽
ipcMain.handle('handle-file-drop', async (event, filePaths) => {
  // 处理拖拽的文件
  for (const filePath of filePaths) {
    const ext = path.extname(filePath).toLowerCase();
    if (['.zip', '.rar', '.7z'].includes(ext)) {
      // 处理压缩文件
      mainWindow.webContents.send('file-dropped', { type: 'archive', path: filePath });
    } else if (['.blend', '.fbx', '.obj', '.dae'].includes(ext)) {
      // 处理3D模型文件
      mainWindow.webContents.send('file-dropped', { type: 'model', path: filePath });
    } else if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
      // 处理图片文件
      mainWindow.webContents.send('file-dropped', { type: 'image', path: filePath });
    }
  }
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  dialog.showErrorBox('应用错误', `发生未预期的错误:\n${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  dialog.showErrorBox('应用错误', `Promise被拒绝:\n${reason}`);
});
