@echo off
echo ========================================
echo RPG资源管理器 - 自动测试运行器
echo ========================================
echo.

:MAIN_LOOP
echo [%date% %time%] 检查应用状态...

:: 检查Electron进程是否在运行
tasklist | findstr electron.exe >nul
if %errorlevel% equ 0 (
    echo 检测到Electron应用正在运行，正在重启...
    echo.
    
    :: 终止所有Electron进程
    taskkill /f /im electron.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    
    echo 应用已停止，等待2秒后重新启动...
    timeout /t 2 /nobreak >nul
) else (
    echo 未检测到运行中的Electron应用，准备启动...
    echo.
)

:: 检查必要文件是否存在
if not exist "main.js" (
    echo 错误: 未找到main.js文件
    goto ERROR_EXIT
)

if not exist "rpg_asset_manager_ui.html" (
    echo 错误: 未找到rpg_asset_manager_ui.html文件
    goto ERROR_EXIT
)

if not exist "node_modules" (
    echo 错误: 未找到node_modules，请先运行install.bat
    goto ERROR_EXIT
)

:: 启动应用
echo 正在启动RPG资源管理器...
echo.
start "RPG Asset Manager" cmd /c "npm start && pause"

:: 等待应用启动
echo 等待应用启动完成...
timeout /t 5 /nobreak >nul

:: 检查应用是否成功启动
tasklist | findstr electron.exe >nul
if %errorlevel% equ 0 (
    echo ✅ 应用启动成功！
    echo.
    echo 应用信息:
    echo - 进程ID: 
    for /f "tokens=2" %%i in ('tasklist /fi "imagename eq electron.exe" /fo csv ^| findstr /v "PID"') do echo   %%i
    echo - 启动时间: %date% %time%
    echo.
) else (
    echo ❌ 应用启动失败！
    goto ERROR_EXIT
)

:: 等待用户操作或自动重启
echo 选择操作:
echo 1. 继续监控 (自动重启)
echo 2. 退出监控
echo 3. 手动重启应用
echo.
set /p choice="请输入选择 (1-3): "

if "%choice%"=="1" (
    echo.
    echo 进入监控模式，每30秒检查一次...
    echo 按 Ctrl+C 可随时退出监控
    echo.
    goto MONITOR_LOOP
) else if "%choice%"=="2" (
    echo 退出监控模式
    goto END
) else if "%choice%"=="3" (
    echo 手动重启应用...
    goto MAIN_LOOP
) else (
    echo 无效选择，默认进入监控模式...
    goto MONITOR_LOOP
)

:MONITOR_LOOP
:: 监控循环 - 每30秒检查一次
timeout /t 30 /nobreak >nul

:: 检查应用是否还在运行
tasklist | findstr electron.exe >nul
if %errorlevel% neq 0 (
    echo [%date% %time%] 检测到应用已停止，自动重启...
    goto MAIN_LOOP
) else (
    echo [%date% %time%] 应用运行正常
    goto MONITOR_LOOP
)

:ERROR_EXIT
echo.
echo ❌ 发生错误，请检查:
echo 1. 是否已安装依赖 (运行 install.bat)
echo 2. 文件是否完整
echo 3. 端口是否被占用
echo.
pause
exit /b 1

:END
echo.
echo 感谢使用RPG资源管理器自动测试运行器！
echo.
pause
exit /b 0
