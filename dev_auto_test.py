#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RPG资源管理器 - 开发自动测试脚本
功能：
1. 监控文件变化
2. 自动重启应用
3. 集成测试功能
4. 日志记录
"""

import os
import sys
import time
import subprocess
import threading
import json
from datetime import datetime
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class RPGAssetManagerTester:
    def __init__(self):
        self.app_process = None
        self.is_running = False
        self.restart_delay = 2  # 重启延迟（秒）
        self.monitor_files = [
            'rpg_asset_manager_ui.html',
            'main.js',
            'preload.js',
            'package.json'
        ]
        self.log_file = 'auto_test.log'
        self.setup_logging()
        
    def setup_logging(self):
        """设置日志记录"""
        self.log(f"RPG资源管理器自动测试器启动 - {datetime.now()}")
        
    def log(self, message):
        """记录日志"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        print(log_message)
        
        # 写入日志文件
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_message + '\n')
        except Exception as e:
            print(f"日志写入失败: {e}")
    
    def check_dependencies(self):
        """检查依赖是否安装"""
        self.log("检查依赖...")
        
        if not os.path.exists('node_modules'):
            self.log("❌ 未找到node_modules，请先运行 install.bat")
            return False
            
        if not os.path.exists('main.js'):
            self.log("❌ 未找到main.js文件")
            return False
            
        if not os.path.exists('rpg_asset_manager_ui.html'):
            self.log("❌ 未找到rpg_asset_manager_ui.html文件")
            return False
            
        self.log("✅ 依赖检查通过")
        return True
    
    def stop_app(self):
        """停止应用"""
        if self.app_process and self.app_process.poll() is None:
            self.log("正在停止应用...")
            try:
                self.app_process.terminate()
                self.app_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.log("强制终止应用...")
                self.app_process.kill()
            except Exception as e:
                self.log(f"停止应用时出错: {e}")
            finally:
                self.app_process = None
                
        # 额外检查并终止所有electron进程
        try:
            if os.name == 'nt':  # Windows
                subprocess.run(['taskkill', '/f', '/im', 'electron.exe'], 
                             capture_output=True, check=False)
            else:  # Linux/Mac
                subprocess.run(['pkill', '-f', 'electron'], 
                             capture_output=True, check=False)
        except Exception as e:
            self.log(f"清理进程时出错: {e}")
    
    def start_app(self):
        """启动应用"""
        if not self.check_dependencies():
            return False
            
        self.log("正在启动RPG资源管理器...")
        
        try:
            # 启动npm start
            self.app_process = subprocess.Popen(
                ['npm', 'start'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # 等待应用启动
            time.sleep(3)
            
            # 检查进程是否还在运行
            if self.app_process.poll() is None:
                self.log("✅ 应用启动成功！")
                self.is_running = True
                return True
            else:
                stdout, stderr = self.app_process.communicate()
                self.log(f"❌ 应用启动失败: {stderr}")
                return False
                
        except Exception as e:
            self.log(f"❌ 启动应用时出错: {e}")
            return False
    
    def restart_app(self):
        """重启应用"""
        self.log("🔄 重启应用...")
        self.stop_app()
        time.sleep(self.restart_delay)
        return self.start_app()
    
    def run_tests(self):
        """运行测试"""
        self.log("🧪 运行测试...")
        
        # 检查测试文件
        test_files = [
            'test_enhanced_thumbnails.html',
            'test_thumbnails.html',
            'test_image_urls.html'
        ]
        
        for test_file in test_files:
            if os.path.exists(test_file):
                self.log(f"✅ 找到测试文件: {test_file}")
            else:
                self.log(f"⚠️  未找到测试文件: {test_file}")
        
        # 检查应用状态
        if self.is_running:
            self.log("✅ 应用运行正常")
        else:
            self.log("❌ 应用未运行")
    
    def monitor_files(self):
        """监控文件变化"""
        self.log("👀 开始监控文件变化...")
        
        class FileChangeHandler(FileSystemEventHandler):
            def __init__(self, tester):
                self.tester = tester
                self.last_restart = 0
                
            def on_modified(self, event):
                if event.is_directory:
                    return
                    
                file_path = Path(event.src_path)
                if file_path.name in self.tester.monitor_files:
                    current_time = time.time()
                    # 防止频繁重启（至少间隔5秒）
                    if current_time - self.last_restart > 5:
                        self.tester.log(f"📝 检测到文件变化: {file_path.name}")
                        self.tester.restart_app()
                        self.last_restart = current_time
        
        event_handler = FileChangeHandler(self)
        observer = Observer()
        observer.schedule(event_handler, '.', recursive=False)
        observer.start()
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.log("收到中断信号，停止监控...")
            observer.stop()
        finally:
            observer.join()
    
    def interactive_mode(self):
        """交互模式"""
        while True:
            print("\n" + "="*50)
            print("RPG资源管理器 - 自动测试控制台")
            print("="*50)
            print("1. 启动应用")
            print("2. 停止应用")
            print("3. 重启应用")
            print("4. 运行测试")
            print("5. 开始文件监控")
            print("6. 查看日志")
            print("7. 退出")
            print("="*50)
            
            choice = input("请选择操作 (1-7): ").strip()
            
            if choice == '1':
                self.start_app()
            elif choice == '2':
                self.stop_app()
                self.is_running = False
            elif choice == '3':
                self.restart_app()
            elif choice == '4':
                self.run_tests()
            elif choice == '5':
                print("开始文件监控模式，按 Ctrl+C 退出...")
                try:
                    self.monitor_files()
                except KeyboardInterrupt:
                    self.log("退出文件监控模式")
            elif choice == '6':
                self.show_logs()
            elif choice == '7':
                self.log("退出自动测试器")
                break
            else:
                print("无效选择，请重新输入")
    
    def show_logs(self):
        """显示日志"""
        if os.path.exists(self.log_file):
            print(f"\n📋 最近日志 (最后20行):")
            print("-" * 50)
            try:
                with open(self.log_file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    for line in lines[-20:]:
                        print(line.strip())
            except Exception as e:
                print(f"读取日志失败: {e}")
        else:
            print("暂无日志文件")
    
    def cleanup(self):
        """清理资源"""
        self.log("清理资源...")
        self.stop_app()
        self.log("自动测试器已退出")

def main():
    """主函数"""
    print("🎮 RPG资源管理器 - 开发自动测试脚本")
    print("=" * 50)
    
    tester = RPGAssetManagerTester()
    
    try:
        # 检查是否安装了watchdog
        try:
            import watchdog
        except ImportError:
            print("⚠️  未安装watchdog，文件监控功能不可用")
            print("安装命令: pip install watchdog")
            print("将使用基础模式...")
        
        # 启动交互模式
        tester.interactive_mode()
        
    except KeyboardInterrupt:
        print("\n收到中断信号...")
    except Exception as e:
        print(f"发生错误: {e}")
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()
