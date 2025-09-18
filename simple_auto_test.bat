@echo off
chcp 65001 >nul
echo ========================================
echo 🎮 RPG资源管理器 - 简化自动测试器
echo ========================================
echo.

:: 设置变量
set "APP_NAME=RPG资源管理器"
set "LOG_FILE=auto_test.log"
set "RESTART_DELAY=3"

:: 创建日志函数
:LOG
echo [%date% %time%] %~1
echo [%date% %time%] %~1 >> "%LOG_FILE%"
goto :eof

:: 检查依赖
:CHECK_DEPS
call :LOG "检查依赖..."
if not exist "node_modules" (
    call :LOG "❌ 未找到node_modules，请先运行 install.bat"
    goto :ERROR
)
if not exist "main.js" (
    call :LOG "❌ 未找到main.js文件"
    goto :ERROR
)
if not exist "rpg_asset_manager_ui.html" (
    call :LOG "❌ 未找到rpg_asset_manager_ui.html文件"
    goto :ERROR
)
call :LOG "✅ 依赖检查通过"
goto :eof

:: 停止应用
:STOP_APP
call :LOG "正在停止应用..."
taskkill /f /im electron.exe >nul 2>&1
timeout /t %RESTART_DELAY% /nobreak >nul
goto :eof

:: 启动应用
:START_APP
call :CHECK_DEPS
if errorlevel 1 goto :ERROR

call :LOG "正在启动%APP_NAME%..."
start "RPG Asset Manager" cmd /c "npm start"
timeout /t 5 /nobreak >nul

tasklist | findstr electron.exe >nul
if %errorlevel% equ 0 (
    call :LOG "✅ 应用启动成功！"
    goto :eof
) else (
    call :LOG "❌ 应用启动失败！"
    goto :ERROR
)

:: 重启应用
:RESTART_APP
call :LOG "🔄 重启应用..."
call :STOP_APP
call :START_APP
goto :eof

:: 运行测试
:RUN_TESTS
call :LOG "🧪 运行测试..."

:: 检查测试文件
if exist "test_enhanced_thumbnails.html" (
    call :LOG "✅ 找到测试文件: test_enhanced_thumbnails.html"
) else (
    call :LOG "⚠️  未找到测试文件: test_enhanced_thumbnails.html"
)

if exist "test_thumbnails.html" (
    call :LOG "✅ 找到测试文件: test_thumbnails.html"
) else (
    call :LOG "⚠️  未找到测试文件: test_thumbnails.html"
)

:: 检查应用状态
tasklist | findstr electron.exe >nul
if %errorlevel% equ 0 (
    call :LOG "✅ 应用运行正常"
) else (
    call :LOG "❌ 应用未运行"
)
goto :eof

:: 显示日志
:SHOW_LOGS
if exist "%LOG_FILE%" (
    echo.
    echo 📋 最近日志 (最后10行):
    echo ----------------------------------------
    powershell "Get-Content '%LOG_FILE%' | Select-Object -Last 10"
) else (
    echo 暂无日志文件
)
goto :eof

:: 主菜单
:MENU
echo.
echo ========================================
echo %APP_NAME% - 自动测试控制台
echo ========================================
echo 1. 启动应用
echo 2. 停止应用  
echo 3. 重启应用
echo 4. 运行测试
echo 5. 自动监控模式
echo 6. 查看日志
echo 7. 退出
echo ========================================

set /p choice="请选择操作 (1-7): "

if "%choice%"=="1" goto :START_APP
if "%choice%"=="2" goto :STOP_APP
if "%choice%"=="3" goto :RESTART_APP
if "%choice%"=="4" goto :RUN_TESTS
if "%choice%"=="5" goto :AUTO_MONITOR
if "%choice%"=="6" goto :SHOW_LOGS
if "%choice%"=="7" goto :EXIT

echo 无效选择，请重新输入
goto :MENU

:: 自动监控模式
:AUTO_MONITOR
call :LOG "开始自动监控模式..."
call :LOG "监控文件: rpg_asset_manager_ui.html, main.js, preload.js"
call :LOG "按 Ctrl+C 可随时退出监控"

:MONITOR_LOOP
:: 检查应用是否还在运行
tasklist | findstr electron.exe >nul
if %errorlevel% neq 0 (
    call :LOG "检测到应用已停止，自动重启..."
    call :RESTART_APP
)

:: 等待30秒
timeout /t 30 /nobreak >nul
goto :MONITOR_LOOP

:: 错误处理
:ERROR
echo.
echo ❌ 发生错误，请检查:
echo 1. 是否已安装依赖 (运行 install.bat)
echo 2. 文件是否完整
echo 3. 端口是否被占用
echo.
pause
goto :MENU

:: 退出
:EXIT
call :LOG "退出自动测试器"
echo.
echo 感谢使用%APP_NAME%自动测试器！
echo.
pause
exit /b 0
