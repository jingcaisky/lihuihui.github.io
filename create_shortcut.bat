@echo off
echo 创建RPG资源管理器桌面快捷方式...

REM 获取当前目录
set "CURRENT_DIR=%~dp0"
set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"

REM 创建VBS脚本来生成快捷方式
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%USERPROFILE%\Desktop\RPG资源管理器.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%CURRENT_DIR%\start_hidden.vbs" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%CURRENT_DIR%" >> CreateShortcut.vbs
echo oLink.Description = "RPG美术资源自动化管理系统 v2.0" >> CreateShortcut.vbs
echo oLink.IconLocation = "%CURRENT_DIR%\assets\icon.ico" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

REM 执行VBS脚本
cscript CreateShortcut.vbs

REM 清理临时文件
del CreateShortcut.vbs

echo 桌面快捷方式创建完成！
echo 现在您可以直接双击桌面上的"RPG资源管理器"图标启动应用
pause
