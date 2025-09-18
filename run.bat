@echo off
echo ========================================
echo 启动RPG美术资源管理器桌面版
echo ========================================
echo.

echo 检查依赖...
if not exist "node_modules" (
    echo 错误: 未找到node_modules，请先运行install.bat安装依赖
    pause
    exit /b 1
)

if not exist "main.js" (
    echo 错误: 未找到main.js，请检查文件完整性
    pause
    exit /b 1
)

if not exist "cc0_asset_automation_system.py" (
    echo 错误: 未找到Python脚本文件
    pause
    exit /b 1
)

echo 启动应用...
npm start

if %errorlevel% neq 0 (
    echo 错误: 应用启动失败
    pause
    exit /b 1
)
