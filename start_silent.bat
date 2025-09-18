@echo off
REM 静默启动RPG资源管理器，不显示任何窗口

REM 停止可能正在运行的Electron进程
taskkill /f /im electron.exe >nul 2>&1

REM 检查Node.js环境
node --version >nul 2>&1
if errorlevel 1 (
    start "" "https://nodejs.org/"
    exit /b 1
)

REM 检查依赖
if not exist "node_modules" (
    npm install >nul 2>&1
)

REM 静默启动Electron（不显示控制台窗口）
start "" /min electron . >nul 2>&1

REM 立即退出批处理，不显示任何窗口
exit /b 0
