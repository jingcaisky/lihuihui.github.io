# RPG资源管理器启动指南

## 启动方式

### 1. 普通权限启动（推荐）
使用以下脚本避免管理员权限问题：

```bash
# 方式1：使用批处理脚本
run_normal.bat

# 方式2：使用npm脚本
npm run start:normal
```

### 2. 开发模式启动
```bash
npm run dev
```

### 3. 标准启动
```bash
npm start
```

## 问题解决

### 管理员权限问题
如果遇到管理员权限提示框，请使用 `run_normal.bat` 启动，该脚本会：
- 以普通用户权限运行
- 自动检查Node.js环境
- 自动安装依赖（如果需要）
- 直接启动Electron应用

### GPU进程错误
如果看到GPU进程错误信息，这是正常的，不影响应用功能。错误信息类似：
```
[16580:0918/100239.402:ERROR:gpu_process_host.cc(991)] GPU process exited unexpectedly: exit_code=-1073740791
```

## 环境要求

- Node.js 16.0 或更高版本
- npm 8.0 或更高版本
- Windows 10/11

## 首次运行

1. 确保已安装Node.js
2. 运行 `run_normal.bat`
3. 首次运行会自动安装依赖包
4. 应用启动后即可使用

## 故障排除

### 应用无法启动
1. 检查Node.js是否正确安装：`node --version`
2. 检查npm是否可用：`npm --version`
3. 尝试重新安装依赖：删除 `node_modules` 文件夹，然后运行 `npm install`

### 权限问题
1. 使用 `run_normal.bat` 而不是直接双击 `package.json`
2. 确保当前用户有项目文件夹的读写权限
3. 避免在系统保护目录（如Program Files）中运行

### 依赖问题
1. 删除 `node_modules` 文件夹
2. 删除 `package-lock.json` 文件
3. 运行 `npm install` 重新安装依赖
