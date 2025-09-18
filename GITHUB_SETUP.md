# GitHub仓库设置指南

## 创建GitHub仓库

1. 登录GitHub
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `rpg-asset-manager-v2`
   - Description: `RPG美术资源自动化管理系统 v2.0 - 支持图片预览和批量下载`
   - 选择 Public 或 Private
   - 不要勾选 "Add a README file"（因为我们已经有了）
   - 不要添加 .gitignore（因为我们已经有了）

## 推送代码到GitHub

创建仓库后，GitHub会显示推送命令，类似：

```bash
git remote add origin https://github.com/YOUR_USERNAME/rpg-asset-manager-v2.git
git branch -M main
git push -u origin main
```

请将 `YOUR_USERNAME` 替换为你的GitHub用户名。

## 当前项目状态

项目已包含以下功能：
- ✅ RPG资源搜索和预览
- ✅ 图片预览组件
- ✅ 批量下载管理
- ✅ 普通权限启动脚本
- ✅ 完整的依赖管理
- ✅ 自动化测试脚本

## 文件结构

```
rpg-asset-manager-v2/
├── main.js                          # Electron主进程
├── rpg_asset_manager_ui.html        # 主界面
├── package.json                     # 项目配置
├── run_normal.bat                   # 普通权限启动脚本
├── start_normal.bat                 # 备用启动脚本
├── .gitignore                       # Git忽略文件
├── STARTUP_GUIDE.md                 # 启动指南
├── README.md                        # 项目说明
└── assets/                          # 资源文件
    └── icon.png                     # 应用图标
```

## 注意事项

1. 确保在推送前已经测试过应用能正常启动
2. 不要推送 `node_modules` 文件夹（已在.gitignore中排除）
3. 确保所有敏感信息（如API密钥）已从代码中移除
4. 建议在GitHub仓库中添加适当的标签和描述
