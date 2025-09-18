# CC0游戏美术资源搜索与下载自动化系统

## 🎯 系统概述

这是一个完整的Python自动化系统，用于搜索CC0许可的游戏美术资源并通过Motrix进行多线程下载。系统集成了多个知名资源网站，支持智能分类和批量下载。

## 🏗️ 系统架构

```
CC0资源自动化下载系统
├── 资源搜索模块 (CC0ResourceSearcher)
│   ├── 多平台API集成
│   ├── 关键词优化
│   └── 结果去重
├── 过滤筛选模块
│   ├── 文件类型过滤
│   ├── 分类智能识别
│   └── 质量评估
├── Motrix集成模块 (MotrixDownloader)
│   ├── API通信
│   ├── 批量任务创建
│   └── 下载状态监控
└── 主控管理器 (CC0DownloadManager)
    ├── 流程控制
    ├── 配置管理
    └── 结果统计
```

## 🚀 功能特点

### 1. 多平台支持
- **OpenGameArt.org**: 最大的免费游戏美术资源网站
- **Kenney.nl**: 高质量的游戏资源包
- **PolyHaven**: 专业的CC0纹理和HDRI资源
- **Freepik**: 设计资源（需要API）
- **Pixabay**: 图片和视频资源（需要API）

### 2. 智能分类系统
- **角色类** (characters): 英雄、NPC、玩家角色
- **武器类** (weapons): 剑、弓、法杖、魔法武器
- **护甲类** (armor): 头盔、盾牌、装备
- **环境类** (environments): 地形、建筑、城堡、地牢
- **UI元素** (ui_elements): 界面、图标、按钮、菜单
- **特效类** (effects): 粒子、魔法、动画、VFX

### 3. 并发处理
- 多线程搜索多个平台
- 并发添加下载任务
- 智能请求频率控制

### 4. Motrix集成
- 无缝API集成
- 多线程下载支持
- 实时状态监控
- 断点续传支持

## 📦 安装依赖

```bash
pip install requests
```

## 🎮 使用方法

### 基本用法

```bash
# 搜索并下载10个僵尸相关的资源
python cc0_asset_automation_system.py "zombie" -n 10

# 搜索并下载5个环境音效
python cc0_asset_automation_system.py "environment" -t sound -n 5 -f .ogg .wav

# 搜索并下载20个纹理资源
python cc0_asset_automation_system.py "wood texture" -t texture -n 20 -f .jpg .png
```

### 高级用法

```bash
# 限制每个源的结果数量
python cc0_asset_automation_system.py "fantasy" -s 2 -n 6

# 保存搜索结果到文件
python cc0_asset_automation_system.py "medieval" --save-results

# 查看当前下载状态
python cc0_asset_automation_system.py "test" --status
```

### 命令行参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `query` | 搜索关键词 | 必需 |
| `-t, --type` | 资源类型 | 无 |
| `-n, --number` | 最大下载数量 | 10 |
| `-f, --file-types` | 文件类型过滤器 | .zip .png .jpg .ogg .wav |
| `-s, --max-per-source` | 每个源的最大结果数 | 3 |
| `--status` | 显示下载状态 | False |
| `--save-results` | 保存搜索结果 | False |

## 📁 目录结构

```
H:\XJ\rpg_assets\
├── characters\     # 角色模型
├── weapons\        # 武器资源
├── armor\          # 护甲装备
├── environments\   # 环境场景
├── ui_elements\    # UI元素
├── effects\        # 特效资源
└── misc\           # 其他资源
```

## ⚙️ 配置说明

### Motrix配置
- **RPC URL**: `http://127.0.0.1:16800/jsonrpc`
- **RPC Token**: `a2HrlXF2L18b`
- **下载目录**: `H:\XJ\rpg_assets`

### 搜索配置
- **并发线程数**: 5
- **请求延迟**: 1秒
- **超时时间**: 15秒

## 📊 使用示例

### 示例1: 搜索仙侠角色资源
```bash
python cc0_asset_automation_system.py "fantasy character warrior" -t character -n 5
```

**输出:**
```
🎯 开始搜索: fantasy character warrior
✅ opengameart: 找到 3 个结果
✅ kenney: 找到 2 个结果
📊 总计找到 5 个唯一资源
📋 筛选结果统计:
  📁 按分类:
    - characters: 5 个
  🌐 按来源:
    - opengameart: 3 个
    - kenney: 2 个
✅ 已添加: Fantasy Warrior Pack -> 9f84e9d171ecebf5
✅ 已添加: Medieval Character Set -> 76cc4d7f0c6d1e5e
📊 批量下载任务完成: ✅ 5 成功, ❌ 0 失败
🎉 成功添加 5 个下载任务到Motrix！
```

### 示例2: 查看下载状态
```bash
python cc0_asset_automation_system.py "test" --status
```

**输出:**
```
📊 当前活跃下载任务: 3 个
  - Fantasy Warrior Pack.zip: 45.2% (1.2 MB/s)
  - Medieval Character Set.zip: 78.9% (856 KB/s)
  - Magic Effects Pack.zip: 12.3% (2.1 MB/s)
```

## 🔧 故障排除

### 常见问题

1. **Motrix连接失败**
   ```
   ❌ Motrix连接失败
   ```
   **解决方案**: 确保Motrix正在运行，检查RPC端口16800是否开放

2. **没有找到资源**
   ```
   ❌ 未找到任何资源
   ```
   **解决方案**: 尝试不同的关键词，检查网络连接

3. **下载任务添加失败**
   ```
   ❌ 添加任务失败
   ```
   **解决方案**: 检查下载URL是否有效，确保有足够的磁盘空间

### 日志文件
系统会自动生成 `cc0_downloader.log` 日志文件，记录详细的操作过程和错误信息。

## 🎨 资源分类说明

### 自动分类规则
系统会根据资源标题和搜索关键词自动分类：

- **角色类**: character, hero, player, npc, avatar, person, warrior, mage
- **武器类**: weapon, sword, bow, staff, magic, blade, axe, spear
- **护甲类**: armor, helmet, shield, clothing, equipment, gear, armour
- **环境类**: environment, terrain, building, castle, dungeon, level, scene
- **UI元素**: ui, interface, icon, button, menu, gui, hud
- **特效类**: effect, particle, magic, spell, animation, vfx, fx

### 手动分类
如果自动分类不准确，可以手动调整分类目录。

## 📈 性能优化

### 并发设置
- **搜索并发**: 5个线程同时搜索不同平台
- **下载并发**: 5个线程同时添加下载任务
- **请求延迟**: 1秒间隔避免被限制

### 资源限制
- **每源最大结果**: 3个（可调整）
- **总下载数量**: 10个（可调整）
- **文件类型过滤**: 支持多种格式

## 🔒 许可证说明

本系统专门搜索CC0（Creative Commons Zero）许可的资源，这些资源可以：
- ✅ 商业使用
- ✅ 修改和分发
- ✅ 无需署名
- ✅ 无版权限制

## 📞 技术支持

如遇到问题，请检查：
1. Python版本 >= 3.7
2. Motrix客户端是否运行
3. 网络连接是否正常
4. 日志文件中的错误信息

## 🎯 未来计划

- [ ] 支持更多资源网站
- [ ] 添加资源预览功能
- [ ] 实现资源质量评分
- [ ] 添加批量重命名功能
- [ ] 支持资源去重检查
- [ ] 添加Web界面
