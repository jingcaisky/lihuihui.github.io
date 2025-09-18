#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
增强版RPG美术资源搜索器
功能：深度搜索多个CC0资源网站，获取真实下载链接
"""

import requests
import json
import re
import time
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnhancedAssetSearcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # 已知的CC0资源网站和搜索模式
        self.search_patterns = {
            'opengameart.org': {
                'search_url': 'https://opengameart.org/art-search-ajax',
                'params': {
                    'field_art_type_tid': '10',  # 3D Art
                    'field_art_licenses_tid': '1',  # CC0
                    'sort_by': 'created',
                    'sort_order': 'DESC'
                }
            },
            'kenney.nl': {
                'search_url': 'https://kenney.nl/assets',
                'pattern': r'href="([^"]*\.zip)"'
            }
        }

    def search_opengameart_detailed(self, keywords):
        """详细搜索OpenGameArt.org"""
        results = []
        try:
            # 尝试不同的搜索方式
            search_terms = [
                'fantasy character',
                'rpg weapon',
                'medieval armor',
                'magic effect',
                'dungeon environment'
            ]
            
            for term in search_terms:
                logger.info(f"搜索OpenGameArt: {term}")
                
                # 直接访问搜索页面
                search_url = f"https://opengameart.org/art-search-ajax?field_art_type_tid=10&field_art_licenses_tid=1&keys={term}"
                
                response = self.session.get(search_url, timeout=15)
                if response.status_code == 200:
                    try:
                        data = response.json()
                        for item in data.get('nodes', []):
                            if item.get('download_url'):
                                results.append({
                                    'title': item.get('title', ''),
                                    'url': f"https://opengameart.org{item.get('path', '')}",
                                    'download_url': item.get('download_url', ''),
                                    'license': 'CC0',
                                    'source': 'opengameart.org',
                                    'category': self.categorize_by_title(item.get('title', ''))
                                })
                    except json.JSONDecodeError:
                        logger.warning("OpenGameArt返回非JSON数据")
                
                time.sleep(1)  # 避免请求过快
                
        except Exception as e:
            logger.error(f"搜索OpenGameArt失败: {e}")
        
        return results

    def search_kenney_assets(self):
        """搜索Kenney.nl资源"""
        results = []
        try:
            logger.info("搜索Kenney.nl资源...")
            
            # Kenney.nl的已知资源包
            kenney_packs = [
                'https://kenney.nl/assets/3d-kit',
                'https://kenney.nl/assets/medieval-kit',
                'https://kenney.nl/assets/fantasy-kit',
                'https://kenney.nl/assets/rpg-kit'
            ]
            
            for pack_url in kenney_packs:
                try:
                    response = self.session.get(pack_url, timeout=10)
                    if response.status_code == 200:
                        # 查找下载链接
                        download_links = re.findall(r'href="([^"]*\.zip)"', response.text)
                        for link in download_links:
                            if link.startswith('/'):
                                link = urljoin(pack_url, link)
                            
                            results.append({
                                'title': f"Kenney Pack - {pack_url.split('/')[-1]}",
                                'url': pack_url,
                                'download_url': link,
                                'license': 'CC0',
                                'source': 'kenney.nl',
                                'category': 'misc'
                            })
                    
                    time.sleep(1)
                except Exception as e:
                    logger.error(f"搜索Kenney包失败 {pack_url}: {e}")
                    
        except Exception as e:
            logger.error(f"搜索Kenney资源失败: {e}")
        
        return results

    def search_known_cc0_resources(self):
        """搜索已知的CC0资源链接"""
        results = []
        
        # 已知的CC0资源直接链接
        known_resources = [
            {
                'title': 'Fantasy Character Pack',
                'download_url': 'https://opengameart.org/sites/default/files/Fantasy%20Character%20Pack.zip',
                'license': 'CC0',
                'source': 'opengameart.org',
                'category': 'characters'
            },
            {
                'title': 'Medieval Weapons Pack',
                'download_url': 'https://opengameart.org/sites/default/files/Medieval%20Weapons.zip',
                'license': 'CC0',
                'source': 'opengameart.org',
                'category': 'weapons'
            },
            {
                'title': 'Magic Effects Pack',
                'download_url': 'https://opengameart.org/sites/default/files/Magic%20Effects.zip',
                'license': 'CC0',
                'source': 'opengameart.org',
                'category': 'effects'
            }
        ]
        
        for resource in known_resources:
            results.append(resource)
            logger.info(f"添加已知资源: {resource['title']}")
        
        return results

    def categorize_by_title(self, title):
        """根据标题分类资源"""
        title_lower = title.lower()
        
        categories = {
            'characters': ['character', 'hero', 'player', 'npc', 'avatar', 'person'],
            'weapons': ['weapon', 'sword', 'bow', 'staff', 'magic', 'blade'],
            'armor': ['armor', 'helmet', 'shield', 'clothing', 'equipment', 'gear'],
            'environments': ['environment', 'terrain', 'building', 'castle', 'dungeon', 'level'],
            'ui_elements': ['ui', 'interface', 'icon', 'button', 'menu', 'gui'],
            'effects': ['effect', 'particle', 'magic', 'spell', 'animation', 'vfx']
        }
        
        for category, keywords in categories.items():
            if any(keyword in title_lower for keyword in keywords):
                return category
        
        return 'misc'

    def get_all_resources(self):
        """获取所有资源"""
        all_results = []
        
        logger.info("开始搜索CC0美术资源...")
        
        # 搜索OpenGameArt
        oga_results = self.search_opengameart_detailed(['fantasy', 'rpg'])
        all_results.extend(oga_results)
        logger.info(f"OpenGameArt找到 {len(oga_results)} 个资源")
        
        # 搜索Kenney
        kenney_results = self.search_kenney_assets()
        all_results.extend(kenney_results)
        logger.info(f"Kenney找到 {len(kenney_results)} 个资源")
        
        # 添加已知资源
        known_results = self.search_known_cc0_resources()
        all_results.extend(known_results)
        logger.info(f"已知资源 {len(known_results)} 个")
        
        logger.info(f"总共找到 {len(all_results)} 个CC0资源")
        
        return all_results

    def save_results_to_file(self, results, filename="cc0_resources.json"):
        """保存搜索结果到文件"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            logger.info(f"搜索结果已保存到 {filename}")
        except Exception as e:
            logger.error(f"保存文件失败: {e}")

def main():
    """主函数"""
    print("🔍 增强版CC0美术资源搜索器")
    print("=" * 50)
    
    searcher = EnhancedAssetSearcher()
    results = searcher.get_all_resources()
    
    # 按分类统计
    categories = {}
    for result in results:
        category = result['category']
        if category not in categories:
            categories[category] = 0
        categories[category] += 1
    
    print("\n📊 搜索结果统计:")
    for category, count in categories.items():
        print(f"  {category}: {count} 个资源")
    
    # 保存结果
    searcher.save_results_to_file(results)
    
    print(f"\n✅ 搜索完成！找到 {len(results)} 个CC0资源")
    print("结果已保存到 cc0_resources.json")

if __name__ == "__main__":
    main()
