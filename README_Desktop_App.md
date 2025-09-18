# RPG美术资源自动化管理系统 - 桌面版

## 🎯 应用概述

这是一个基于Electron的桌面应用程序，将原有的Web界面转换为原生桌面应用，提供更好的用户体验和系统集成。

## 🚀 功能特点

### 桌面应用特性
- ✅ 原生桌面窗口和菜单
- ✅ 系统托盘集成
- ✅ 文件拖拽支持
- ✅ 原生文件对话框
- ✅ 系统通知
- ✅ 自动更新支持
- ✅ 跨平台支持 (Windows/macOS/Linux)

### 核心功能
- 🔍 多平台CC0资源搜索
- ⬇️ 集成Motrix下载管理
- 📁 智能资源分类
- ⚙️ 完整的设置管理
- 🎮 游戏工具风格界面

## 📋 系统要求

### 必需环境
- **Node.js**: 16.0.0 或更高版本
- **Python**: 3.7 或更高版本
- **操作系统**: Windows 10+, macOS 10.14+, Ubuntu 18.04+

### Python依赖
```bash
pip install requests beautifulsoup4
```

## 🛠️ 安装步骤

### 方法1: 自动安装 (推荐)
1. 双击运行 `install.bat` (Windows) 或 `install.sh` (Linux/macOS)
2. 等待依赖安装完成
3. 运行 `run.bat` 启动应用

### 方法2: 手动安装
```bash
# 1. 安装Node.js依赖
npm install

# 2. 安装Python依赖
pip install requests beautifulsoup4

# 3. 启动应用
npm start
```

## 🎮 使用方法

### 启动应用
```bash
# 正常启动
npm start

# 开发模式 (带调试工具)
npm run dev
```

### 主要功能

#### 1. 资源搜索
- 在搜索面板输入关键词
- 选择资源类型和数量限制
- 选择搜索平台
- 点击"开始搜索"

#### 2. 下载管理
- 查看下载进度和状态
- 暂停/继续/取消下载任务
- 批量操作下载任务

#### 3. 分类管理
- 浏览不同分类的资源
- 手动分类和批量重命名
- 导出分类统计

#### 4. 系统设置
- 配置下载目录
- 设置搜索参数
- 配置Motrix连接
- 管理分类规则

### 快捷键
- `Ctrl+N`: 新建搜索
- `Ctrl+F`: 开始搜索
- `Ctrl+O`: 打开下载目录
- `Ctrl+,`: 打开设置
- `Ctrl+Shift+P`: 暂停全部下载
- `Ctrl+Shift+R`: 继续全部下载
- `Escape`: 停止搜索

## 🔧 开发说明

### 项目结构
```
rpg-asset-manager-desktop/
├── main.js                 # Electron主进程
├── preload.js             # 预加载脚本
├── rpg_asset_manager_ui.html  # 渲染进程界面
├── package.json           # 项目配置
├── assets/                # 应用资源
│   └── icon.svg          # 应用图标
├── cc0_asset_automation_system.py  # Python后端
└── README_Desktop_App.md  # 说明文档
```

### 构建应用
```bash
# 构建当前平台
npm run build

# 构建Windows版本
npm run build-win

# 构建macOS版本
npm run build-mac

# 构建Linux版本
npm run build-linux
```

### 开发模式
```bash
# 启动开发服务器
npm run dev

# 这将启动应用并自动打开开发者工具
```

## 🔌 集成说明

### Python后端集成
- 应用通过IPC调用Python脚本
- 支持实时输出和错误处理
- 自动管理Python进程生命周期

### Motrix集成
- 通过HTTP API与Motrix通信
- 支持连接测试和状态监控
- 自动配置下载参数

### 文件系统集成
- 原生文件选择对话框
- 拖拽文件支持
- 自动创建目录结构

## 🐛 故障排除

### 常见问题

#### 1. 应用无法启动
```bash
# 检查Node.js版本
node --version

# 检查依赖安装
npm list

# 重新安装依赖
npm install
```

#### 2. Python脚本执行失败
```bash
# 检查Python版本
python --version

# 检查Python依赖
pip list | grep requests

# 重新安装Python依赖
pip install requests beautifulsoup4
```

#### 3. Motrix连接失败
- 确保Motrix客户端正在运行
- 检查端口16800是否被占用
- 验证RPC Token配置

#### 4. 文件权限问题
- 确保应用有写入下载目录的权限
- 检查防病毒软件是否阻止文件操作

### 日志文件
- 应用日志: `%APPDATA%/rpg-asset-manager/logs/`
- Python日志: `cc0_downloader.log`

## 📦 分发说明

### 构建分发包
```bash
# 构建所有平台
npm run dist

# 构建特定平台
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

### 安装包特性
- **Windows**: NSIS安装程序，支持自动更新
- **macOS**: DMG磁盘镜像，代码签名支持
- **Linux**: AppImage便携包，无需安装

## 🔄 更新说明

### 自动更新
- 应用启动时自动检查更新
- 支持增量更新和完整更新
- 更新失败时自动回滚

### 手动更新
1. 下载最新版本
2. 运行安装程序
3. 重启应用

## 📞 技术支持

### 获取帮助
- 查看日志文件获取详细错误信息
- 检查系统要求是否满足
- 确认网络连接正常

### 报告问题
- 提供详细的错误信息
- 包含系统环境信息
- 附上相关日志文件

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 🎉 致谢

感谢所有贡献者和开源社区的支持！

---

**RPG美术资源自动化管理系统桌面版 v2.0.0**
