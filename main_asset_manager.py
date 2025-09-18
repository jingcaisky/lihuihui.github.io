#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RPG美术资源管理器 - 主控制脚本
功能：统一管理搜索、下载、分类等所有功能
"""

import os
import sys
import json
import time
from enhanced_asset_searcher import EnhancedAssetSearcher
from motrix_batch_downloader import MotrixBatchDownloader

def print_banner():
    """打印欢迎横幅"""
    print("🎮 RPG美术资源管理器")
    print("=" * 60)
    print("功能：全网搜索CC0美术资源，自动分类，批量下载")
    print("=" * 60)

def show_menu():
    """显示主菜单"""
    print("\n📋 主菜单:")
    print("1. 🔍 搜索CC0美术资源")
    print("2. 📥 批量下载到Motrix")
    print("3. 📊 查看下载状态")
    print("4. 📁 查看已下载资源")
    print("5. 🧹 清理项目文件")
    print("6. ⚙️  配置设置")
    print("0. 🚪 退出程序")
    print("-" * 40)

def search_resources():
    """搜索资源"""
    print("\n🔍 开始搜索CC0美术资源...")
    
    searcher = EnhancedAssetSearcher()
    results = searcher.get_all_resources()
    
    if results:
        # 按分类统计
        categories = {}
        for result in results:
            category = result['category']
            if category not in categories:
                categories[category] = 0
            categories[category] += 1
        
        print(f"\n✅ 搜索完成！找到 {len(results)} 个CC0资源")
        print("\n📊 分类统计:")
        for category, count in categories.items():
            print(f"  📁 {category}: {count} 个资源")
        
        # 保存结果
        searcher.save_results_to_file(results)
        print(f"\n💾 搜索结果已保存到 cc0_resources.json")
        
        return results
    else:
        print("❌ 没有找到任何资源")
        return []

def batch_download():
    """批量下载"""
    print("\n📥 开始批量下载...")
    
    # 检查资源文件是否存在
    if not os.path.exists("cc0_resources.json"):
        print("❌ 没有找到资源文件，请先运行搜索功能")
        return
    
    downloader = MotrixBatchDownloader()
    
    # 测试Motrix连接
    if not downloader.test_motrix_connection():
        print("❌ 无法连接到Motrix，请确保Motrix正在运行")
        return
    
    # 加载资源
    resources = downloader.load_resources_from_file()
    if not resources:
        print("❌ 没有找到可下载的资源")
        return
    
    # 显示资源统计
    categories = {}
    for resource in resources:
        category = resource['category']
        if category not in categories:
            categories[category] = []
        categories[category].append(resource)
    
    print(f"\n📋 准备下载 {len(resources)} 个资源:")
    for category, items in categories.items():
        print(f"  📁 {category}: {len(items)} 个资源")
    
    # 确认下载
    response = input("\n是否开始批量下载？(y/n): ").lower().strip()
    if response != 'y':
        print("取消下载")
        return
    
    # 开始下载
    successful, failed = downloader.batch_add_tasks(resources)
    
    if successful:
        print(f"\n🎉 成功添加 {len(successful)} 个下载任务到Motrix！")
        print("请打开Motrix客户端查看下载进度。")
    else:
        print("❌ 没有成功添加任何下载任务")

def check_download_status():
    """检查下载状态"""
    print("\n📊 检查下载状态...")
    
    downloader = MotrixBatchDownloader()
    if downloader.test_motrix_connection():
        active_tasks = downloader.get_download_status()
        if not active_tasks:
            print("📭 当前没有活跃的下载任务")
    else:
        print("❌ 无法连接到Motrix")

def view_downloaded_resources():
    """查看已下载的资源"""
    print("\n📁 查看已下载资源...")
    
    assets_dir = "H:\\XJ\\rpg_assets"
    if not os.path.exists(assets_dir):
        print("❌ 资源目录不存在")
        return
    
    total_size = 0
    total_files = 0
    
    print(f"\n📂 资源目录: {assets_dir}")
    print("-" * 50)
    
    for root, dirs, files in os.walk(assets_dir):
        level = root.replace(assets_dir, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f"{indent}📁 {os.path.basename(root)}/")
        
        subindent = ' ' * 2 * (level + 1)
        for file in files:
            file_path = os.path.join(root, file)
            file_size = os.path.getsize(file_path)
            total_size += file_size
            total_files += 1
            
            size_mb = file_size / (1024 * 1024)
            print(f"{subindent}📄 {file} ({size_mb:.2f} MB)")
    
    print("-" * 50)
    print(f"📊 总计: {total_files} 个文件, {total_size / (1024 * 1024):.2f} MB")

def cleanup_project():
    """清理项目文件"""
    print("\n🧹 清理项目文件...")
    
    files_to_remove = [
        "cc0_resources.json",
        "download_tools",
        "motrix-source"
    ]
    
    removed_count = 0
    for item in files_to_remove:
        if os.path.exists(item):
            try:
                if os.path.isdir(item):
                    import shutil
                    shutil.rmtree(item)
                    print(f"🗑️  删除目录: {item}")
                else:
                    os.remove(item)
                    print(f"🗑️  删除文件: {item}")
                removed_count += 1
            except Exception as e:
                print(f"❌ 删除失败 {item}: {e}")
    
    if removed_count > 0:
        print(f"\n✅ 清理完成，删除了 {removed_count} 个项目")
    else:
        print("📭 没有找到需要清理的文件")

def show_settings():
    """显示设置"""
    print("\n⚙️  当前设置:")
    print(f"  📁 资源目录: H:\\XJ\\rpg_assets")
    print(f"  🔗 Motrix RPC: http://127.0.0.1:16800/jsonrpc")
    print(f"  🔑 RPC Token: a2HrlXF2L18b")
    print(f"  🧵 下载线程: 5")
    print(f"  📦 每类最大下载数: 3")

def main():
    """主函数"""
    print_banner()
    
    while True:
        show_menu()
        
        try:
            choice = input("\n请选择操作 (0-6): ").strip()
            
            if choice == '0':
                print("\n👋 感谢使用RPG美术资源管理器！")
                break
            elif choice == '1':
                search_resources()
            elif choice == '2':
                batch_download()
            elif choice == '3':
                check_download_status()
            elif choice == '4':
                view_downloaded_resources()
            elif choice == '5':
                cleanup_project()
            elif choice == '6':
                show_settings()
            else:
                print("❌ 无效选择，请重新输入")
            
            input("\n按回车键继续...")
            
        except KeyboardInterrupt:
            print("\n\n👋 程序被用户中断")
            break
        except Exception as e:
            print(f"\n❌ 发生错误: {e}")
            input("按回车键继续...")

if __name__ == "__main__":
    main()
