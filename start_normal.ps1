# RPG资源管理器 - 普通权限启动脚本
# 此脚本确保以普通用户权限启动，避免管理员权限提示

Write-Host "正在启动RPG资源管理器..." -ForegroundColor Green

# 停止可能正在运行的Electron进程
Get-Process -Name "electron" -ErrorAction SilentlyContinue | Stop-Process -Force

# 检查Node.js环境
try {
    $nodeVersion = node --version
    Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Yellow
} catch {
    Write-Host "错误: 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Cyan
    Read-Host "按任意键退出"
    exit 1
}

# 检查依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "正在安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 依赖安装失败" -ForegroundColor Red
        Read-Host "按任意键退出"
        exit 1
    }
}

Write-Host "启动应用..." -ForegroundColor Green

# 启动Electron应用
Start-Process -FilePath "electron" -ArgumentList "." -NoNewWindow

Write-Host "应用已启动！" -ForegroundColor Green
