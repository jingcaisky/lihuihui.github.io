@echo off
chcp 65001 >nul
echo ========================================
echo 🎯 任务完成 - 自动测试触发器
echo ========================================
echo.

:: 获取当前时间
set "COMPLETE_TIME=%date% %time%"
echo [%COMPLETE_TIME%] 检测到任务完成，启动自动测试...

:: 记录到任务日志
echo [%COMPLETE_TIME%] 任务完成 - 自动测试启动 >> task_completion.log

:: 等待2秒让用户看到消息
timeout /t 2 /nobreak >nul

:: 检查是否有运行中的应用
tasklist | findstr electron.exe >nul
if %errorlevel% equ 0 (
    echo 🔄 检测到运行中的应用，正在重启以应用最新更改...
    taskkill /f /im electron.exe >nul 2>&1
    timeout /t 3 /nobreak >nul
) else (
    echo 🚀 未检测到运行中的应用，直接启动...
)

:: 快速启动应用
echo 正在启动RPG资源管理器...
start "RPG Asset Manager - Auto Test" cmd /c "npm start"

:: 等待应用启动
echo 等待应用启动完成...
timeout /t 5 /nobreak >nul

:: 验证启动状态
tasklist | findstr electron.exe >nul
if %errorlevel% equ 0 (
    echo ✅ 自动测试启动成功！
    echo.
    echo 📋 测试检查清单:
    echo 1. ✅ 应用已启动
    echo 2. 🔍 请检查缩略图显示效果
    echo 3. 🔍 请测试图片预览功能
    echo 4. 🔍 请查看控制台日志 (F12)
    echo.
    echo 💡 提示: 应用将在新窗口中打开
    echo.
    
    :: 记录成功启动
    echo [%COMPLETE_TIME%] 自动测试启动成功 >> task_completion.log
    
) else (
    echo ❌ 自动测试启动失败！
    echo.
    echo 🔧 请手动检查:
    echo 1. 依赖是否完整
    echo 2. 文件是否有语法错误
    echo 3. 端口是否被占用
    echo.
    
    :: 记录启动失败
    echo [%COMPLETE_TIME%] 自动测试启动失败 >> task_completion.log
)

:: 显示任务完成日志
echo.
echo 📊 任务完成历史:
if exist "task_completion.log" (
    echo 最近5次任务完成记录:
    echo ----------------------------------------
    powershell "Get-Content 'task_completion.log' | Select-Object -Last 5"
) else (
    echo 暂无任务完成记录
)

echo.
echo 🎯 自动测试完成！
echo 按任意键退出...
pause >nul
