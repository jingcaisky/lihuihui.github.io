@echo off
echo 启动RPG资源管理器 (普通权限模式)
echo.

REM 停止可能正在运行的Electron进程
taskkill /f /im electron.exe >nul 2>&1
taskkill /f /im "RPG美术资源管理器.exe" >nul 2>&1

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 检查npm是否可用
npm --version >nul 2>&1
if errorlevel 1 (
    echo 错误: npm不可用
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if errorlevel 1 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

echo 正在启动应用...
echo.

REM 以普通权限启动应用
npm start

echo.
echo 应用已关闭
pause
