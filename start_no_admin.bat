@echo off
REM 无管理员权限启动RPG资源管理器

REM 停止现有进程
taskkill /f /im electron.exe >nul 2>&1

REM 检查环境
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js
    pause
    exit /b 1
)

REM 检查依赖
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if errorlevel 1 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

REM 使用npm start启动，但隐藏控制台窗口
start "" /min cmd /c "npm start"

REM 立即退出，不显示窗口
exit /b 0
