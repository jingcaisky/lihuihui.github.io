Set WshShell = CreateObject("WScript.Shell")

' 停止可能正在运行的Electron进程
WshShell.Run "taskkill /f /im electron.exe", 0, True

' 检查Node.js环境
Dim result
result = WshShell.Run("node --version", 0, True)
If result <> 0 Then
    WshShell.Run "https://nodejs.org/", 1
    WScript.Quit
End If

' 检查依赖
Dim fso
Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FolderExists("node_modules") Then
    WshShell.Run "npm install", 0, True
End If

' 静默启动Electron - 使用完整路径
Dim currentDir
currentDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "cmd /c cd /d """ & currentDir & """ && npx electron .", 0, False

' 退出VBS脚本
WScript.Quit
