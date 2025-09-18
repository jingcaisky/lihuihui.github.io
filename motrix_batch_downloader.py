#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Motrix批量下载器
功能：读取资源列表，批量添加到Motrix下载
"""

import requests
import json
import time
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MotrixBatchDownloader:
    def __init__(self, motrix_rpc_url="http://127.0.0.1:16800/jsonrpc", rpc_token="a2HrlXF2L18b"):
        self.motrix_rpc_url = motrix_rpc_url
        self.rpc_token = rpc_token
        self.download_dir = "H:\\XJ\\rpg_assets"
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def test_motrix_connection(self):
        """测试Motrix连接"""
        try:
            data = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "aria2.getVersion",
                "params": [f"token:{self.rpc_token}"]
            }
            
            response = self.session.post(self.motrix_rpc_url, json=data, timeout=5)
            if response.status_code == 200:
                result = response.json()
                if 'result' in result:
                    logger.info(f"✅ Motrix连接成功，版本: {result['result'].get('version', 'Unknown')}")
                    return True
            
            logger.error("❌ Motrix连接失败")
            return False
            
        except Exception as e:
            logger.error(f"❌ Motrix连接测试失败: {e}")
            return False

    def add_download_task(self, resource_info):
        """添加单个下载任务"""
        try:
            # 确保下载目录存在
            category_dir = os.path.join(self.download_dir, resource_info['category'])
            os.makedirs(category_dir, exist_ok=True)
            
            # 清理文件名
            safe_title = "".join(c for c in resource_info['title'] if c.isalnum() or c in (' ', '-', '_')).rstrip()
            if len(safe_title) > 50:
                safe_title = safe_title[:50]
            
            data = {
                "jsonrpc": "2.0",
                "id": int(time.time() * 1000),  # 使用时间戳作为ID
                "method": "aria2.addUri",
                "params": [
                    f"token:{self.rpc_token}",
                    [resource_info['download_url']],
                    {
                        "dir": category_dir,
                        "out": f"{safe_title}.zip",
                        "max-connection-per-server": "16",
                        "split": "16"
                    }
                ]
            }
            
            response = self.session.post(self.motrix_rpc_url, json=data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if 'result' in result:
                    task_id = result['result']
                    logger.info(f"✅ 已添加: {resource_info['title']} -> {task_id}")
                    return {
                        'success': True,
                        'task_id': task_id,
                        'resource': resource_info
                    }
                else:
                    logger.error(f"❌ 添加失败: {resource_info['title']} - {result}")
            else:
                logger.error(f"❌ HTTP错误: {response.status_code}")
                
        except Exception as e:
            logger.error(f"❌ 添加任务失败 {resource_info['title']}: {e}")
        
        return {
            'success': False,
            'resource': resource_info
        }

    def batch_add_tasks(self, resources, max_workers=5):
        """批量添加下载任务"""
        if not self.test_motrix_connection():
            logger.error("无法连接到Motrix，请确保Motrix正在运行")
            return
        
        logger.info(f"开始批量添加 {len(resources)} 个下载任务...")
        
        successful_tasks = []
        failed_tasks = []
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # 提交所有任务
            future_to_resource = {
                executor.submit(self.add_download_task, resource): resource 
                for resource in resources
            }
            
            # 处理完成的任务
            for future in as_completed(future_to_resource):
                resource = future_to_resource[future]
                try:
                    result = future.result()
                    if result['success']:
                        successful_tasks.append(result)
                    else:
                        failed_tasks.append(result)
                except Exception as e:
                    logger.error(f"处理任务异常 {resource['title']}: {e}")
                    failed_tasks.append({
                        'success': False,
                        'resource': resource,
                        'error': str(e)
                    })
                
                # 添加延迟避免请求过快
                time.sleep(0.1)
        
        # 统计结果
        logger.info(f"\n📊 批量下载任务完成:")
        logger.info(f"✅ 成功: {len(successful_tasks)} 个")
        logger.info(f"❌ 失败: {len(failed_tasks)} 个")
        
        if failed_tasks:
            logger.info("\n❌ 失败的任务:")
            for task in failed_tasks:
                logger.info(f"  - {task['resource']['title']}")
        
        return successful_tasks, failed_tasks

    def load_resources_from_file(self, filename="cc0_resources.json"):
        """从文件加载资源列表"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                resources = json.load(f)
            logger.info(f"从 {filename} 加载了 {len(resources)} 个资源")
            return resources
        except FileNotFoundError:
            logger.error(f"文件 {filename} 不存在")
            return []
        except Exception as e:
            logger.error(f"加载文件失败: {e}")
            return []

    def get_download_status(self):
        """获取下载状态"""
        try:
            data = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "aria2.tellActive",
                "params": [f"token:{self.rpc_token}"]
            }
            
            response = self.session.post(self.motrix_rpc_url, json=data, timeout=5)
            if response.status_code == 200:
                result = response.json()
                if 'result' in result:
                    active_tasks = result['result']
                    logger.info(f"当前活跃下载任务: {len(active_tasks)} 个")
                    
                    for task in active_tasks:
                        completed = int(task.get('completedLength', 0))
                        total = int(task.get('totalLength', 0))
                        speed = int(task.get('downloadSpeed', 0))
                        
                        if total > 0:
                            progress = (completed / total) * 100
                            logger.info(f"  - {task.get('files', [{}])[0].get('path', 'Unknown')}: {progress:.1f}% ({speed/1024:.1f} KB/s)")
                    
                    return active_tasks
            
        except Exception as e:
            logger.error(f"获取下载状态失败: {e}")
        
        return []

def main():
    """主函数"""
    print("🚀 Motrix批量下载器")
    print("=" * 50)
    
    downloader = MotrixBatchDownloader()
    
    # 加载资源列表
    resources = downloader.load_resources_from_file()
    if not resources:
        print("❌ 没有找到资源文件，请先运行搜索脚本")
        return
    
    # 按分类显示资源
    categories = {}
    for resource in resources:
        category = resource['category']
        if category not in categories:
            categories[category] = []
        categories[category].append(resource)
    
    print("\n📋 资源列表:")
    for category, items in categories.items():
        print(f"  {category}: {len(items)} 个资源")
    
    # 询问用户是否继续
    response = input("\n是否开始批量下载？(y/n): ").lower().strip()
    if response != 'y':
        print("取消下载")
        return
    
    # 开始批量下载
    successful, failed = downloader.batch_add_tasks(resources)
    
    if successful:
        print(f"\n🎉 成功添加 {len(successful)} 个下载任务到Motrix！")
        print("请打开Motrix客户端查看下载进度。")
        
        # 显示当前下载状态
        print("\n📊 当前下载状态:")
        downloader.get_download_status()

if __name__ == "__main__":
    main()
