#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RPG美术资源自动下载器
功能：全网搜索CC0许可的美术资源，并交给Motrix多线程下载
"""

import requests
import json
import time
import os
import re
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RPGAssetDownloader:
    def __init__(self, motrix_rpc_url="http://127.0.0.1:16800/jsonrpc", rpc_token="a2HrlXF2L18b"):
        self.motrix_rpc_url = motrix_rpc_url
        self.rpc_token = rpc_token
        self.download_dir = "H:\\XJ\\rpg_assets"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # 资源分类配置
        self.categories = {
            'characters': ['character', 'hero', 'player', 'npc', 'avatar'],
            'weapons': ['weapon', 'sword', 'bow', 'staff', 'magic'],
            'armor': ['armor', 'helmet', 'shield', 'clothing', 'equipment'],
            'environments': ['environment', 'terrain', 'building', 'castle', 'dungeon'],
            'ui_elements': ['ui', 'interface', 'icon', 'button', 'menu'],
            'effects': ['effect', 'particle', 'magic', 'spell', 'animation']
        }
        
        # 已知的CC0资源网站
        self.cc0_sites = [
            'opengameart.org',
            'freepik.com',
            'pixabay.com',
            'unsplash.com',
            'pexels.com'
        ]

    def search_opengameart(self, keywords, max_results=20):
        """搜索OpenGameArt.org的CC0资源"""
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
            
            response = self.session.get(search_url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                for item in data.get('nodes', [])[:max_results]:
                    if any(keyword.lower() in item.get('title', '').lower() for keyword in keywords):
                        results.append({
                            'title': item.get('title', ''),
                            'url': f"https://opengameart.org{item.get('path', '')}",
                            'download_url': item.get('download_url', ''),
                            'license': 'CC0',
                            'category': self.categorize_asset(item.get('title', ''), keywords)
                        })
        except Exception as e:
            logger.error(f"搜索OpenGameArt失败: {e}")
        
        return results

    def search_other_sites(self, keywords, max_results=10):
        """搜索其他CC0资源网站"""
        results = []
        
        # 搜索Pixabay
        try:
            pixabay_url = "https://pixabay.com/api/"
            params = {
                'key': 'your_api_key_here',  # 需要注册获取API key
                'q': ' '.join(keywords),
                'image_type': 'all',
                'category': 'backgrounds',
                'min_width': 1920,
                'min_height': 1080,
                'safesearch': 'true',
                'per_page': max_results
            }
            # 注意：实际使用时需要有效的API key
        except Exception as e:
            logger.error(f"搜索Pixabay失败: {e}")
        
        return results

    def categorize_asset(self, title, keywords):
        """根据标题和关键词分类资源"""
        title_lower = title.lower()
        
        for category, category_keywords in self.categories.items():
            if any(keyword in title_lower for keyword in category_keywords):
                return category
        
        # 根据搜索关键词分类
        for keyword in keywords:
            keyword_lower = keyword.lower()
            for category, category_keywords in self.categories.items():
                if keyword_lower in category_keywords:
                    return category
        
        return 'misc'  # 默认分类

    def add_to_motrix(self, download_info):
        """添加下载任务到Motrix"""
        try:
            headers = {'Content-Type': 'application/json'}
            data = {
                "jsonrpc": "2.0",
                "id": int(time.time()),
                "method": "aria2.addUri",
                "params": [
                    f"token:{self.rpc_token}",
                    [download_info['download_url']],
                    {
                        "dir": os.path.join(self.download_dir, download_info['category']),
                        "out": f"{download_info['title'][:50]}.zip"
                    }
                ]
            }
            
            response = requests.post(self.motrix_rpc_url, headers=headers, json=data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if 'result' in result:
                    logger.info(f"已添加下载任务: {download_info['title']} -> {result['result']}")
                    return result['result']
                else:
                    logger.error(f"添加下载任务失败: {result}")
            else:
                logger.error(f"Motrix API请求失败: {response.status_code}")
                
        except Exception as e:
            logger.error(f"添加下载任务到Motrix失败: {e}")
        
        return None

    def batch_download(self, search_keywords, max_per_category=5):
        """批量搜索和下载"""
        logger.info(f"开始搜索关键词: {search_keywords}")
        
        all_results = []
        
        # 搜索OpenGameArt
        logger.info("搜索OpenGameArt.org...")
        oga_results = self.search_opengameart(search_keywords, max_per_category * 2)
        all_results.extend(oga_results)
        
        # 搜索其他网站
        logger.info("搜索其他CC0资源网站...")
        other_results = self.search_other_sites(search_keywords, max_per_category)
        all_results.extend(other_results)
        
        logger.info(f"找到 {len(all_results)} 个资源")
        
        # 按分类整理
        categorized_results = {}
        for result in all_results:
            category = result['category']
            if category not in categorized_results:
                categorized_results[category] = []
            categorized_results[category].append(result)
        
        # 限制每个分类的下载数量
        download_tasks = []
        for category, results in categorized_results.items():
            for result in results[:max_per_category]:
                download_tasks.append(result)
        
        logger.info(f"准备下载 {len(download_tasks)} 个资源")
        
        # 多线程添加下载任务
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_task = {
                executor.submit(self.add_to_motrix, task): task 
                for task in download_tasks
            }
            
            for future in as_completed(future_to_task):
                task = future_to_task[future]
                try:
                    task_id = future.result()
                    if task_id:
                        logger.info(f"✅ 成功添加: {task['title']}")
                    else:
                        logger.warning(f"❌ 添加失败: {task['title']}")
                except Exception as e:
                    logger.error(f"处理任务失败 {task['title']}: {e}")
        
        logger.info("批量下载任务添加完成！")

    def create_directories(self):
        """创建资源分类目录"""
        for category in self.categories.keys():
            dir_path = os.path.join(self.download_dir, category)
            os.makedirs(dir_path, exist_ok=True)
            logger.info(f"创建目录: {dir_path}")

def main():
    """主函数"""
    print("🎮 RPG美术资源自动下载器")
    print("=" * 50)
    
    # 创建下载器实例
    downloader = RPGAssetDownloader()
    
    # 创建目录
    downloader.create_directories()
    
    # 定义搜索关键词
    search_keywords = [
        'fantasy', 'rpg', 'character', 'hero', 'warrior', 'mage',
        'sword', 'armor', 'weapon', 'magic', 'dungeon', 'castle',
        'medieval', 'knight', 'wizard', 'dragon', 'monster'
    ]
    
    # 开始批量下载
    downloader.batch_download(search_keywords, max_per_category=3)
    
    print("\n🎉 下载任务已全部添加到Motrix！")
    print("请打开Motrix客户端查看下载进度。")

if __name__ == "__main__":
    main()
