@echo off
title RPG资源管理器 - 普通权限启动
echo.
echo ========================================
echo   RPG美术资源管理器 v2.0
echo   普通权限启动模式
echo ========================================
echo.

REM 停止可能正在运行的进程
echo 正在停止现有进程...
taskkill /f /im electron.exe >nul 2>&1
timeout /t 2 >nul

REM 检查Node.js
echo 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖
if not exist "node_modules" (
    echo [信息] 正在安装依赖包...
    npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

echo [成功] 环境检查完成
echo.
echo 正在启动RPG资源管理器...
echo.

REM 直接启动Electron，不使用npm start
electron .

echo.
echo 应用已退出
pause
