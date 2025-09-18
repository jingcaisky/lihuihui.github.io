@echo off
echo ========================================
echo RPG美术资源管理器 - 桌面版安装脚本
echo ========================================
echo.

echo 检查Node.js安装...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js版本:
node --version

echo.
echo 检查Python安装...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Python，请先安装Python 3.7+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Python版本:
python --version

echo.
echo 安装Electron依赖...
npm install

if %errorlevel% neq 0 (
    echo 错误: npm install 失败
    pause
    exit /b 1
)

echo.
echo 检查Python依赖...
pip install requests beautifulsoup4

if %errorlevel% neq 0 (
    echo 警告: Python依赖安装失败，请手动安装
    echo pip install requests beautifulsoup4
)

echo.
echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 运行应用: npm start
echo 开发模式: npm run dev
echo 构建应用: npm run build
echo.
pause
