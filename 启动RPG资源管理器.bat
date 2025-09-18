@echo off
title RPG资源管理器启动器
color 0A

echo.
echo ========================================
echo   RPG美术资源管理器 v2.0
echo   无管理员权限启动
echo ========================================
echo.

REM 停止现有进程
echo [1/4] 停止现有进程...
taskkill /f /im electron.exe >nul 2>&1
timeout /t 1 >nul

REM 检查环境
echo [2/4] 检查运行环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖
echo [3/4] 检查依赖包...
if not exist "node_modules" (
    echo 正在安装依赖，请稍候...
    npm install
    if errorlevel 1 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

REM 启动应用
echo [4/4] 启动应用...
echo.
echo 正在启动RPG资源管理器...
echo 请稍候，应用即将打开...

REM 使用start命令启动，避免显示控制台
start "" /min electron .

REM 等待2秒后关闭启动器窗口
timeout /t 2 >nul
exit
