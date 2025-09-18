@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 RPG资源管理器 - 快速测试启动器
echo ========================================
echo.

:: 记录开始时间
set "START_TIME=%date% %time%"
echo [%START_TIME%] 开始快速测试...

:: 检查并停止现有应用
echo 检查现有应用...
tasklist | findstr electron.exe >nul
if %errorlevel% equ 0 (
    echo 发现运行中的应用，正在停止...
    taskkill /f /im electron.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo ✅ 应用已停止
) else (
    echo ✅ 未发现运行中的应用
)

:: 快速检查依赖
echo 快速检查依赖...
if not exist "node_modules" (
    echo ❌ 未找到node_modules，请先运行 install.bat
    pause
    exit /b 1
)

if not exist "main.js" (
    echo ❌ 未找到main.js文件
    pause
    exit /b 1
)

if not exist "rpg_asset_manager_ui.html" (
    echo ❌ 未找到rpg_asset_manager_ui.html文件
    pause
    exit /b 1
)

echo ✅ 依赖检查通过

:: 启动应用
echo 正在启动应用...
start "RPG Asset Manager" cmd /c "npm start && pause"

:: 等待应用启动
echo 等待应用启动 (5秒)...
timeout /t 5 /nobreak >nul

:: 验证启动
tasklist | findstr electron.exe >nul
if %errorlevel% equ 0 (
    echo ✅ 应用启动成功！
    echo.
    echo 📊 启动信息:
    echo - 启动时间: %START_TIME%
    echo - 当前时间: %date% %time%
    echo - 进程状态: 运行中
    echo.
    
    :: 显示进程信息
    echo 🔍 进程详情:
    for /f "tokens=2,5" %%a in ('tasklist /fi "imagename eq electron.exe" /fo csv ^| findstr /v "PID"') do (
        echo - 进程ID: %%a
        echo - 内存使用: %%b
    )
    echo.
    
    :: 检查测试文件
    echo 🧪 测试文件检查:
    if exist "test_enhanced_thumbnails.html" (
        echo ✅ test_enhanced_thumbnails.html
    ) else (
        echo ❌ test_enhanced_thumbnails.html
    )
    
    if exist "test_thumbnails.html" (
        echo ✅ test_thumbnails.html
    ) else (
        echo ❌ test_thumbnails.html
    )
    
    if exist "test_image_urls.html" (
        echo ✅ test_image_urls.html
    ) else (
        echo ❌ test_image_urls.html
    )
    echo.
    
    echo 🎯 测试建议:
    echo 1. 打开应用界面，检查缩略图显示
    echo 2. 尝试搜索不同类型的资源
    echo 3. 测试图片预览功能
    echo 4. 检查控制台日志 (F12)
    echo.
    
    echo 📝 快速操作:
    echo - 按任意键重新启动应用
    echo - 按 Ctrl+C 退出
    echo.
    
    pause >nul
    echo 重新启动应用...
    goto :eof
    
) else (
    echo ❌ 应用启动失败！
    echo.
    echo 🔍 故障排除:
    echo 1. 检查控制台错误信息
    echo 2. 确认端口未被占用
    echo 3. 检查依赖是否完整
    echo.
    pause
    exit /b 1
)

:: 重新启动
echo 重新启动应用...
taskkill /f /im electron.exe >nul 2>&1
timeout /t 2 /nobreak >nul
goto :eof
