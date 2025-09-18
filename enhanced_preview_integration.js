/**
 * RPG资源管理器 - 增强图片预览组件
 * 集成到现有的rpg_asset_manager_ui.html中
 */

// 图片预览组件类
class ImagePreviewComponent {
    constructor() {
        this.lazyLoader = null;
        this.currentResource = null;
        this.init();
    }

    init() {
        this.initLazyLoader();
        this.createModalHTML();
        this.bindEvents();
    }

    // 初始化懒加载器
    initLazyLoader() {
        if ('IntersectionObserver' in window) {
            this.lazyLoader = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.lazyLoader.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
        }
    }

    // 创建模态框HTML
    createModalHTML() {
        const modalHTML = `
            <div class="image-modal-overlay" id="imageModalOverlay">
                <div class="image-modal-content">
                    <button class="image-modal-close" onclick="imagePreview.closeModal()">&times;</button>
                    <div class="image-modal-header">
                        <h2 class="image-modal-title" id="imageModalTitle"></h2>
                        <div class="image-modal-meta" id="imageModalMeta"></div>
                    </div>
                    <div class="image-modal-body">
                        <img class="image-modal-image" id="imageModalImage" src="" alt="">
                        <div class="image-modal-description" id="imageModalDescription"></div>
                    </div>
                    <div class="image-modal-footer">
                        <button class="image-modal-btn image-modal-btn-primary" onclick="imagePreview.downloadResource()">
                            <span>⬇️</span> 下载资源
                        </button>
                        <button class="image-modal-btn image-modal-btn-secondary" onclick="imagePreview.addToFavorites()">
                            <span>❤️</span> 添加到收藏
                        </button>
                        <button class="image-modal-btn image-modal-btn-secondary" onclick="imagePreview.shareResource()">
                            <span>🔗</span> 分享
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 添加CSS样式
        const styles = `
            <style>
                /* 图片预览模态框样式 */
                .image-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(15px);
                }

                .image-modal-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }

                .image-modal-content {
                    position: relative;
                    max-width: 90vw;
                    max-height: 90vh;
                    background: rgba(26, 26, 46, 0.98);
                    border-radius: 20px;
                    overflow: hidden;
                    transform: scale(0.8);
                    transition: transform 0.3s ease;
                    border: 2px solid rgba(0, 212, 255, 0.3);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .image-modal-overlay.active .image-modal-content {
                    transform: scale(1);
                }

                .image-modal-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.8);
                    color: #fff;
                    border: none;
                    border-radius: 50%;
                    width: 45px;
                    height: 45px;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                    z-index: 10001;
                }

                .image-modal-close:hover {
                    background: rgba(255, 0, 0, 0.8);
                    transform: scale(1.1);
                }

                .image-modal-header {
                    padding: 30px 30px 20px;
                    background: rgba(0, 0, 0, 0.3);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .image-modal-title {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 15px;
                    color: #00d4ff;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                }

                .image-modal-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .image-modal-meta .modal-tag {
                    background: rgba(0, 212, 255, 0.2);
                    color: #00d4ff;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    backdrop-filter: blur(10px);
                }

                .image-modal-meta .modal-tag.license-cc0 {
                    background: rgba(0, 255, 136, 0.2);
                    color: #00ff88;
                    border-color: rgba(0, 255, 136, 0.3);
                }

                .image-modal-meta .modal-tag.license-ccby {
                    background: rgba(255, 193, 7, 0.2);
                    color: #ffc107;
                    border-color: rgba(255, 193, 7, 0.3);
                }

                .image-modal-body {
                    padding: 0;
                    position: relative;
                }

                .image-modal-image {
                    width: 100%;
                    height: auto;
                    max-height: 60vh;
                    object-fit: contain;
                    display: block;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                }

                .image-modal-description {
                    padding: 25px 30px;
                    color: #ccc;
                    line-height: 1.8;
                    font-size: 16px;
                    background: rgba(0, 0, 0, 0.2);
                }

                .image-modal-footer {
                    padding: 25px 30px;
                    background: rgba(0, 0, 0, 0.3);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .image-modal-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    backdrop-filter: blur(10px);
                }

                .image-modal-btn-primary {
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
                }

                .image-modal-btn-secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: #e8e8e8;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .image-modal-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                }

                .image-modal-btn-primary:hover {
                    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
                }

                /* 增强的缩略图样式 */
                .enhanced-thumbnail-container {
                    position: relative;
                    width: 100%;
                    height: 200px;
                    overflow: hidden;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border-radius: 12px;
                }

                .enhanced-thumbnail-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: all 0.4s ease;
                    opacity: 0;
                    transform: scale(1.1);
                }

                .enhanced-thumbnail-image.loaded {
                    opacity: 1;
                    transform: scale(1);
                }

                .enhanced-thumbnail-placeholder {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    color: #666;
                    font-size: 48px;
                    transition: opacity 0.3s ease;
                }

                .enhanced-thumbnail-placeholder.hidden {
                    opacity: 0;
                    pointer-events: none;
                }

                .enhanced-loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(0, 212, 255, 0.3);
                    border-top: 4px solid #00d4ff;
                    border-radius: 50%;
                    animation: enhanced-spin 1s linear infinite;
                }

                @keyframes enhanced-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .enhanced-preview-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: rgba(0, 0, 0, 0.8);
                    color: #00d4ff;
                    border: none;
                    border-radius: 10px;
                    padding: 10px 15px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .resource-card:hover .enhanced-preview-btn {
                    opacity: 1;
                }

                .enhanced-preview-btn:hover {
                    background: rgba(0, 212, 255, 0.2);
                    transform: scale(1.05);
                }

                .enhanced-loading-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #00d4ff, #00ff88);
                    transition: width 0.3s ease;
                    width: 0%;
                    border-radius: 0 0 12px 12px;
                }

                /* 响应式设计 */
                @media (max-width: 768px) {
                    .image-modal-content {
                        max-width: 95vw;
                        max-height: 95vh;
                    }
                    
                    .image-modal-header {
                        padding: 20px 20px 15px;
                    }
                    
                    .image-modal-title {
                        font-size: 24px;
                    }
                    
                    .image-modal-description {
                        padding: 20px;
                        font-size: 14px;
                    }
                    
                    .image-modal-footer {
                        padding: 20px;
                        flex-direction: column;
                    }
                    
                    .image-modal-btn {
                        justify-content: center;
                    }
                }
            </style>
        `;

        // 将HTML和样式添加到页面
        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // 绑定事件
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // 点击模态框背景关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('image-modal-overlay')) {
                this.closeModal();
            }
        });
    }

    // 加载图片
    loadImage(imgElement) {
        const src = imgElement.dataset.src;
        const placeholder = imgElement.parentElement.querySelector('.enhanced-thumbnail-placeholder');
        const progressBar = imgElement.parentElement.querySelector('.enhanced-loading-progress');

        if (!src) return;

        // 显示加载进度
        if (progressBar) {
            progressBar.style.width = '30%';
        }

        const img = new Image();
        img.onload = () => {
            imgElement.src = src;
            imgElement.classList.add('loaded');
            
            if (placeholder) {
                placeholder.classList.add('hidden');
            }
            
            if (progressBar) {
                progressBar.style.width = '100%';
                setTimeout(() => {
                    progressBar.style.opacity = '0';
                }, 300);
            }
        };

        img.onerror = () => {
            if (placeholder) {
                placeholder.innerHTML = '<div style="color: #ff6b6b; font-size: 14px; text-align: center;">图片加载失败</div>';
            }
            if (progressBar) {
                progressBar.style.display = 'none';
            }
        };

        img.src = src;
    }

    // 创建增强的资源卡片HTML
    createEnhancedResourceCard(resource) {
        return `
            <div class="resource-card" onclick="selectResource('${resource.id}')">
                <div class="enhanced-thumbnail-container">
                    <img class="enhanced-thumbnail-image" 
                         data-src="${resource.thumbnail_url || resource.thumbnail}" 
                         alt="${resource.title}"
                         loading="lazy">
                    <div class="enhanced-thumbnail-placeholder">
                        <div class="enhanced-loading-spinner"></div>
                    </div>
                    <div class="enhanced-loading-progress"></div>
                    <button class="enhanced-preview-btn" onclick="event.stopPropagation(); imagePreview.openModal('${resource.id}')">
                        <span>👁️</span> 预览
                    </button>
                </div>
                <div class="resource-info">
                    <div class="resource-title">${resource.title}</div>
                    <div class="resource-license">
                        <span class="license-tag ${resource.licenseType}">${resource.license}</span>
                        ${resource.modelType ? `<span class="model-type-tag type-${resource.modelType.toLowerCase()}">${resource.modelType}</span>` : ''}
                    </div>
                    <div class="resource-meta">
                        <span class="meta-tag">${resource.size}</span>
                        <span class="meta-tag">${resource.format}</span>
                        <span class="meta-tag">${resource.platform}</span>
                        <span class="meta-tag">★${resource.rating}</span>
                    </div>
                    <div class="resource-tags">
                        ${resource.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="resource-actions">
                        <button class="action-btn download-btn ${resource.licenseType === 'ccby' ? 'ccby-download' : ''}" 
                                onclick="event.stopPropagation(); downloadResource(${resource.id})"
                                data-resource-id="${resource.id}">
                            <span>⬇️</span>
                            <span>${resource.licenseType === 'ccby' ? '下载并复制署名' : '免费下载'}</span>
                        </button>
                        <button class="action-btn favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${resource.id})">
                            <span>❤️</span>
                        </button>
                        <button class="action-btn preview-btn" onclick="event.stopPropagation(); imagePreview.openModal('${resource.id}')">
                            <span>👁️</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 打开模态框
    openModal(resourceId) {
        // 从当前资源列表中找到对应的资源
        const resource = currentResources.find(r => r.id == resourceId);
        if (!resource) return;

        this.currentResource = resource;

        // 设置模态框内容
        const modalImage = document.getElementById('imageModalImage');
        const modalTitle = document.getElementById('imageModalTitle');
        const modalMeta = document.getElementById('imageModalMeta');
        const modalDescription = document.getElementById('imageModalDescription');

        modalImage.src = resource.detail_url || resource.thumbnail_url || resource.thumbnail;
        modalTitle.textContent = resource.title;
        modalDescription.textContent = resource.description || '暂无详细描述';

        // 设置元数据
        modalMeta.innerHTML = `
            <span class="modal-tag">${resource.size}</span>
            <span class="modal-tag">${resource.format}</span>
            <span class="modal-tag">${resource.platform}</span>
            <span class="modal-tag license-${resource.licenseType}">${resource.license}</span>
            <span class="modal-tag">★ ${resource.rating}</span>
            <span class="modal-tag">⬇️ ${resource.downloads || 0}</span>
        `;

        // 显示模态框
        const modal = document.getElementById('imageModalOverlay');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // 关闭模态框
    closeModal() {
        const modal = document.getElementById('imageModalOverlay');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentResource = null;
    }

    // 下载资源
    downloadResource() {
        if (this.currentResource) {
            // 调用现有的下载函数
            if (typeof downloadResource === 'function') {
                downloadResource(this.currentResource.id);
            } else {
                alert(`开始下载: ${this.currentResource.title}`);
            }
            this.closeModal();
        }
    }

    // 添加到收藏
    addToFavorites() {
        if (this.currentResource) {
            // 调用现有的收藏函数
            if (typeof toggleFavorite === 'function') {
                toggleFavorite(this.currentResource.id);
            } else {
                alert(`已添加到收藏: ${this.currentResource.title}`);
            }
        }
    }

    // 分享资源
    shareResource() {
        if (this.currentResource && navigator.share) {
            navigator.share({
                title: this.currentResource.title,
                text: this.currentResource.description,
                url: window.location.href
            });
        } else {
            // 降级处理：复制到剪贴板
            const shareText = `${this.currentResource.title} - ${this.currentResource.description}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert('资源信息已复制到剪贴板');
            });
        }
    }

    // 初始化懒加载
    initLazyLoading() {
        if (this.lazyLoader) {
            const images = document.querySelectorAll('.enhanced-thumbnail-image');
            images.forEach(img => {
                this.lazyLoader.observeImage(img);
            });
        }
    }
}

// 创建全局实例
const imagePreview = new ImagePreviewComponent();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImagePreviewComponent;
}
