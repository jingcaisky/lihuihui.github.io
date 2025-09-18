#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CC0游戏美术资源搜索与下载自动化系统
支持多平台搜索并通过Motrix进行多线程下载
融合了完整的设计思路和功能架构
"""

import argparse
import json
import logging
import os
import re
import sys
import time
from typing import List, Dict, Any, Optional
import requests
import urllib.parse
import concurrent.futures
from datetime import datetime

# 修复Windows系统Unicode输出问题
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("cc0_downloader.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("CC0Downloader")

class CC0ResourceSearcher:
    """CC0资源搜索器 - 多平台集成"""
    
    def __init__(self):
        self.sources = {
            "opengameart": self.search_opengameart,
            "kenney": self.search_kenney,
            "freepik": self.search_freepik,
            "pixabay": self.search_pixabay,
            "polyhaven": self.search_polyhaven
        }
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # 资源分类配置
        self.categories = {
            'characters': ['character', 'hero', 'player', 'npc', 'avatar', 'person', 'warrior', 'mage'],
            'weapons': ['weapon', 'sword', 'bow', 'staff', 'magic', 'blade', 'axe', 'spear'],
            'armor': ['armor', 'helmet', 'shield', 'clothing', 'equipment', 'gear', 'armour'],
            'environments': ['environment', 'terrain', 'building', 'castle', 'dungeon', 'level', 'scene'],
            'ui_elements': ['ui', 'interface', 'icon', 'button', 'menu', 'gui', 'hud'],
            'effects': ['effect', 'particle', 'magic', 'spell', 'animation', 'vfx', 'fx']
        }
    
    def search_all_sources(self, query: str, resource_type: str = None, max_per_source: int = 5) -> List[Dict]:
        """从所有源并发搜索资源"""
        all_results = []
        
        logger.info(f"开始多平台搜索: {query}")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_source = {
                executor.submit(self.sources[source], query, resource_type, max_per_source): source 
                for source in self.sources
            }
            
            for future in concurrent.futures.as_completed(future_to_source):
                source_name = future_to_source[future]
                try:
                    results = future.result()
                    all_results.extend(results)
                    logger.info(f"[SUCCESS] {source_name}: 找到 {len(results)} 个结果")
                except Exception as e:
                    logger.error(f"[ERROR] 搜索 {source_name} 时出错: {str(e)}")
        
        # 去重处理
        unique_results = self._deduplicate_results(all_results)
        logger.info(f"[INFO] 总计找到 {len(unique_results)} 个唯一资源")
        
        return unique_results
    
    def search_opengameart(self, query: str, resource_type: str = None, max_results: int = 5) -> List[Dict]:
        """搜索OpenGameArt上的CC0资源"""
        results = []
        
        try:
            # 构建搜索URL
            search_url = "https://opengameart.org/art-search-ajax"
            params = {
                'field_art_type_tid': '10',  # 3D Art
                'field_art_licenses_tid': '1',  # CC0
                'sort_by': 'created',
                'sort_order': 'DESC',
                'page': '0'
            }
            
            response = self.session.get(search_url, params=params, timeout=15)
            if response.status_code == 200:
                try:
                    data = response.json()
                    for item in data.get('nodes', [])[:max_results]:
                        title = item.get('title', '')
                        if any(keyword.lower() in title.lower() for keyword in query.split()):
                            results.append({
                                'title': title,
                                'url': f"https://opengameart.org{item.get('path', '')}",
                                'download_url': item.get('download_url', ''),
                                'source': 'opengameart',
                                'license': 'CC0',
                                'category': self._categorize_resource(title, query),
                                'file_size': item.get('file_size', 'Unknown'),
                                'downloads': item.get('downloads', 0)
                            })
                except json.JSONDecodeError:
                    logger.warning("OpenGameArt返回非JSON数据")
            
            time.sleep(1)  # 避免请求过快
                    
        except Exception as e:
            logger.error(f"搜索OpenGameArt时出错: {str(e)}")
            
        return results
    
    def search_kenney(self, query: str, resource_type: str = None, max_results: int = 5) -> List[Dict]:
        """搜索Kenney资产"""
        results = []
        
        # Kenney.nl的已知资源包
        kenney_packs = [
            {
                'title': '3D Kit',
                'url': 'https://kenney.nl/assets/3d-kit',
                'download_url': 'https://kenney.nl/assets/3d-kit/download'
            },
            {
                'title': 'Medieval Kit',
                'url': 'https://kenney.nl/assets/medieval-kit',
                'download_url': 'https://kenney.nl/assets/medieval-kit/download'
            },
            {
                'title': 'Fantasy Kit',
                'url': 'https://kenney.nl/assets/fantasy-kit',
                'download_url': 'https://kenney.nl/assets/fantasy-kit/download'
            },
            {
                'title': 'RPG Kit',
                'url': 'https://kenney.nl/assets/rpg-kit',
                'download_url': 'https://kenney.nl/assets/rpg-kit/download'
            }
        ]
        
        try:
            for pack in kenney_packs[:max_results]:
                if any(keyword.lower() in pack['title'].lower() for keyword in query.split()):
                    results.append({
                        'title': f"Kenney {pack['title']}",
                        'url': pack['url'],
                        'download_url': pack['download_url'],
                        'source': 'kenney',
                        'license': 'CC0',
                        'category': self._categorize_resource(pack['title'], query),
                        'file_size': 'Unknown',
                        'downloads': 0
                    })
                    
        except Exception as e:
            logger.error(f"搜索Kenney时出错: {str(e)}")
            
        return results
    
    def search_freepik(self, query: str, resource_type: str = None, max_results: int = 5) -> List[Dict]:
        """搜索Freepik上的免费资源（简化版）"""
        # 实际实现需要处理API或网页抓取
        # 这里返回空列表作为示例
        return []
    
    def search_pixabay(self, query: str, resource_type: str = None, max_results: int = 5) -> List[Dict]:
        """搜索Pixabay上的免费资源（简化版）"""
        # 需要API密钥
        return []
    
    def search_polyhaven(self, query: str, resource_type: str = None, max_results: int = 5) -> List[Dict]:
        """搜索PolyHaven上的CC0资源"""
        results = []
        
        # PolyHaven的已知资源
        polyhaven_resources = [
            {
                'title': 'HDRI Environment Pack',
                'url': 'https://polyhaven.com/hdris',
                'download_url': 'https://polyhaven.com/hdris/download'
            },
            {
                'title': 'Texture Pack',
                'url': 'https://polyhaven.com/textures',
                'download_url': 'https://polyhaven.com/textures/download'
            }
        ]
        
        try:
            for resource in polyhaven_resources[:max_results]:
                if any(keyword.lower() in resource['title'].lower() for keyword in query.split()):
                    results.append({
                        'title': f"PolyHaven {resource['title']}",
                        'url': resource['url'],
                        'download_url': resource['download_url'],
                        'source': 'polyhaven',
                        'license': 'CC0',
                        'category': self._categorize_resource(resource['title'], query),
                        'file_size': 'Unknown',
                        'downloads': 0
                    })
                    
        except Exception as e:
            logger.error(f"搜索PolyHaven时出错: {str(e)}")
            
        return results
    
    def _categorize_resource(self, title: str, query: str) -> str:
        """根据标题和查询词分类资源"""
        title_lower = title.lower()
        query_lower = query.lower()
        
        for category, keywords in self.categories.items():
            if any(keyword in title_lower for keyword in keywords):
                return category
            if any(keyword in query_lower for keyword in keywords):
                return category
        
        return 'misc'
    
    def _deduplicate_results(self, results: List[Dict]) -> List[Dict]:
        """去重处理"""
        seen_urls = set()
        unique_results = []
        
        for result in results:
            url = result.get('download_url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_results.append(result)
        
        return unique_results

class MotrixDownloader:
    """Motrix下载器集成"""
    
    def __init__(self, motrix_api_url: str = "http://127.0.0.1:16800/jsonrpc", rpc_token: str = "a2HrlXF2L18b"):
        self.api_url = motrix_api_url
        self.rpc_token = rpc_token
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'CC0ResourceDownloader/1.0'
        })
        self.download_dir = "H:\\XJ\\rpg_assets"
    
    def test_connection(self) -> bool:
        """测试Motrix连接"""
        try:
            payload = {
                "jsonrpc": "2.0",
                "method": "aria2.getVersion",
                "id": int(time.time()),
                "params": [f"token:{self.rpc_token}"]
            }
            
            response = self.session.post(self.api_url, json=payload, timeout=5)
            if response.status_code == 200:
                result = response.json()
                if 'result' in result:
                    logger.info(f"[SUCCESS] Motrix连接成功，版本: {result['result'].get('version', 'Unknown')}")
                    return True
            
            logger.error("[ERROR] Motrix连接失败")
            return False
            
        except Exception as e:
            logger.error(f"[ERROR] Motrix连接测试失败: {str(e)}")
            return False
    
    def add_download_task(self, resource: Dict) -> Optional[str]:
        """添加下载任务到Motrix"""
        try:
            # 确保下载目录存在
            category_dir = os.path.join(self.download_dir, resource['category'])
            os.makedirs(category_dir, exist_ok=True)
            
            # 清理文件名
            safe_title = "".join(c for c in resource['title'] if c.isalnum() or c in (' ', '-', '_')).rstrip()
            if len(safe_title) > 50:
                safe_title = safe_title[:50]
            
            payload = {
                "jsonrpc": "2.0",
                "method": "aria2.addUri",
                "id": int(time.time() * 1000),
                "params": [
                    f"token:{self.rpc_token}",
                    [resource['download_url']],
                    {
                        "dir": category_dir,
                        "out": f"{safe_title}.zip",
                        "max-connection-per-server": "16",
                        "split": "16"
                    }
                ]
            }
            
            response = self.session.post(self.api_url, json=payload, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if 'result' in result:
                    task_id = result['result']
                    logger.info(f"[SUCCESS] 已添加: {resource['title']} -> {task_id}")
                    return task_id
                else:
                    logger.error(f"[ERROR] 添加失败: {resource['title']} - {result}")
            else:
                logger.error(f"[ERROR] HTTP错误: {response.status_code}")
                
        except Exception as e:
            logger.error(f"[ERROR] 添加任务失败 {resource['title']}: {str(e)}")
        
        return None
    
    def get_download_status(self) -> List[Dict]:
        """获取当前下载状态"""
        try:
            payload = {
                "jsonrpc": "2.0",
                "method": "aria2.tellActive",
                "id": int(time.time()),
                "params": [f"token:{self.rpc_token}"]
            }
            
            response = self.session.post(self.api_url, json=payload, timeout=5)
            if response.status_code == 200:
                result = response.json()
                if 'result' in result:
                    return result['result']
            
        except Exception as e:
            logger.error(f"获取下载状态失败: {str(e)}")
        
        return []
    
    def batch_add_tasks(self, resources: List[Dict], max_workers: int = 5) -> tuple:
        """批量添加下载任务"""
        if not self.test_connection():
            logger.error("无法连接到Motrix，请确保Motrix正在运行")
            return [], resources
        
        logger.info(f"开始批量添加 {len(resources)} 个下载任务...")
        
        successful_tasks = []
        failed_tasks = []
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_resource = {
                executor.submit(self.add_download_task, resource): resource 
                for resource in resources
            }
            
            for future in concurrent.futures.as_completed(future_to_resource):
                resource = future_to_resource[future]
                try:
                    task_id = future.result()
                    if task_id:
                        successful_tasks.append({
                            'task_id': task_id,
                            'resource': resource
                        })
                    else:
                        failed_tasks.append(resource)
                except Exception as e:
                    logger.error(f"处理任务异常 {resource['title']}: {str(e)}")
                    failed_tasks.append(resource)
                
                time.sleep(0.1)  # 避免请求过快
        
        logger.info(f"[INFO] 批量下载任务完成: [SUCCESS] {len(successful_tasks)} 成功, [FAILED] {len(failed_tasks)} 失败")
        return successful_tasks, failed_tasks

class CC0DownloadManager:
    """CC0资源下载管理器 - 主控制器"""
    
    def __init__(self):
        self.searcher = CC0ResourceSearcher()
        self.downloader = MotrixDownloader()
        self.download_dir = "H:\\XJ\\rpg_assets"
        
        # 创建下载目录结构
        self._create_directory_structure()
    
    def _create_directory_structure(self):
        """创建目录结构"""
        categories = ['characters', 'weapons', 'armor', 'environments', 'ui_elements', 'effects', 'misc']
        for category in categories:
            os.makedirs(os.path.join(self.download_dir, category), exist_ok=True)
        logger.info(f"[INFO] 创建目录结构: {self.download_dir}")
    
    def search_and_download(self, query: str, resource_type: str = None, 
                           max_results: int = 10, file_types: List[str] = None,
                           max_per_source: int = 3) -> Dict:
        """搜索并下载资源 - 主流程"""
        logger.info(f"[INFO] 开始搜索: {query}")
        
        # 搜索资源
        results = self.searcher.search_all_sources(query, resource_type, max_per_source)
        
        if not results:
            logger.warning("[WARNING] 未找到任何资源")
            return {'success': False, 'message': '未找到任何资源'}
        
        logger.info(f"[INFO] 共找到 {len(results)} 个资源，开始筛选...")
        
        # 过滤结果
        filtered_results = self._filter_results(results, max_results, file_types)
        
        # 显示结果统计
        self._display_results_summary(filtered_results)
        
        # 下载资源
        successful, failed = self.downloader.batch_add_tasks(filtered_results)
        
        return {
            'success': len(successful) > 0,
            'total_found': len(results),
            'filtered': len(filtered_results),
            'successful': len(successful),
            'failed': len(failed),
            'successful_tasks': successful,
            'failed_tasks': failed
        }
    
    def _filter_results(self, results: List[Dict], max_results: int, 
                       file_types: List[str]) -> List[Dict]:
        """过滤搜索结果"""
        filtered = []
        
        for result in results:
            # 文件类型过滤
            if file_types:
                download_url = result.get('download_url', '').lower()
                if not any(download_url.endswith(ft.lower()) for ft in file_types):
                    continue
            
            filtered.append(result)
            
            if len(filtered) >= max_results:
                break
        
        return filtered
    
    def _display_results_summary(self, results: List[Dict]):
        """显示结果统计"""
        categories = {}
        sources = {}
        
        for result in results:
            category = result.get('category', 'misc')
            source = result.get('source', 'unknown')
            
            categories[category] = categories.get(category, 0) + 1
            sources[source] = sources.get(source, 0) + 1
        
        logger.info(f"[INFO] 筛选结果统计:")
        logger.info(f"  [分类] 按分类:")
        for category, count in categories.items():
            logger.info(f"    - {category}: {count} 个")
        
        logger.info(f"  [来源] 按来源:")
        for source, count in sources.items():
            logger.info(f"    - {source}: {count} 个")
    
    def save_results_to_file(self, results: List[Dict], filename: str = None):
        """保存搜索结果到文件"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"cc0_resources_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            logger.info(f"💾 搜索结果已保存到: {filename}")
        except Exception as e:
            logger.error(f"保存文件失败: {str(e)}")
    
    def get_download_status(self):
        """获取下载状态"""
        active_tasks = self.downloader.get_download_status()
        
        if not active_tasks:
            logger.info("[INFO] 当前没有活跃的下载任务")
            return
        
        logger.info(f"[INFO] 当前活跃下载任务: {len(active_tasks)} 个")
        
        for task in active_tasks:
            completed = int(task.get('completedLength', 0))
            total = int(task.get('totalLength', 0))
            speed = int(task.get('downloadSpeed', 0))
            
            if total > 0:
                progress = (completed / total) * 100
                logger.info(f"  - {task.get('files', [{}])[0].get('path', 'Unknown')}: {progress:.1f}% ({speed/1024:.1f} KB/s)")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="CC0游戏美术资源搜索与下载自动化系统")
    parser.add_argument("query", help="搜索关键词")
    parser.add_argument("-t", "--type", help="资源类型 (character, weapon, environment等)")
    parser.add_argument("-n", "--number", type=int, default=10, 
                       help="最大下载数量 (默认: 10)")
    parser.add_argument("-f", "--file-types", nargs="+", 
                       default=[".zip", ".png", ".jpg", ".ogg", ".wav"],
                       help="文件类型过滤器 (默认: .zip .png .jpg .ogg .wav)")
    parser.add_argument("-s", "--max-per-source", type=int, default=3,
                       help="每个源的最大结果数 (默认: 3)")
    parser.add_argument("--status", action="store_true",
                       help="显示当前下载状态")
    parser.add_argument("--save-results", action="store_true",
                       help="保存搜索结果到文件")
    
    args = parser.parse_args()
    
    # 创建管理器
    manager = CC0DownloadManager()
    
    # 如果只是查看状态
    if args.status:
        manager.get_download_status()
        return
    
    # 执行搜索和下载
    result = manager.search_and_download(
        query=args.query,
        resource_type=args.type,
        max_results=args.number,
        file_types=args.file_types,
        max_per_source=args.max_per_source
    )
    
    # 保存结果
    if args.save_results and result.get('successful_tasks'):
        manager.save_results_to_file([task['resource'] for task in result['successful_tasks']])
    
    # 显示最终结果
    if result['success']:
        print(f"\n[SUCCESS] 成功添加 {result['successful']} 个下载任务到Motrix！")
        print("请打开Motrix客户端查看下载进度。")
    else:
        print("\n[ERROR] 没有成功添加任何下载任务")

if __name__ == "__main__":
    main()
