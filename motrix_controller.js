/**
 * Motrix RPC API 控制器
 * 负责与Motrix应用程序进行通信，管理下载任务
 */

class MotrixController {
    constructor() {
        this.rpcUrl = 'http://127.0.0.1:16800/jsonrpc';
        this.rpcSecret = 'a2HrlXF2L18b'; // Motrix RPC密钥
        this.activeTasks = new Map(); // 存储活跃的下载任务
        this.statusUpdateInterval = null;
        this.isConnected = false;
        
        // 初始化连接
        this.initializeConnection();
    }

    /**
     * 初始化与Motrix的连接
     */
    async initializeConnection() {
        try {
            const response = await this.makeRpcCall('aria2.getVersion');
            if (response && response.result) {
                this.isConnected = true;
                console.log('✅ Motrix连接成功:', response.result);
                this.startStatusMonitoring();
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Motrix连接失败:', error.message);
            this.isConnected = false;
            this.stopStatusMonitoring();
            return false;
        }
    }

    /**
     * 检查连接状态（更严格的检测）
     */
    async checkConnection() {
        try {
            // 使用更简单的ping检测
            const response = await this.makeRpcCall('aria2.getVersion');
            if (response && response.result) {
                if (!this.isConnected) {
                    this.isConnected = true;
                    console.log('✅ Motrix连接恢复');
                    this.startStatusMonitoring();
                }
                return true;
            }
        } catch (error) {
            if (this.isConnected) {
                this.isConnected = false;
                console.log('❌ Motrix连接断开:', error.message);
                this.stopStatusMonitoring();
            }
            return false;
        }
    }

    /**
     * 发送RPC请求到Motrix
     * @param {string} method - RPC方法名
     * @param {Array} params - 参数数组
     * @returns {Promise} RPC响应
     */
    async makeRpcCall(method, params = []) {
        const requestBody = {
            id: Date.now(),
            jsonrpc: '2.0',
            method: method,
            params: params
        };

        // 如果有RPC密钥，添加到参数中
        if (this.rpcSecret) {
            requestBody.params.unshift(`token:${this.rpcSecret}`);
        }

        try {
            const response = await fetch(this.rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(`RPC Error: ${data.error.message}`);
            }

            return data;
        } catch (error) {
            console.error('RPC调用失败:', error);
            throw error;
        }
    }

    /**
     * 添加下载任务
     * @param {string} downloadUrl - 下载链接
     * @param {string} savePath - 保存路径
     * @param {string} fileName - 文件名（可选）
     * @returns {Promise<string>} 任务ID
     */
    async addDownloadTask(downloadUrl, savePath, fileName = null) {
        try {
            const options = {
                dir: savePath
            };

            if (fileName) {
                options.out = fileName;
            }

            const response = await this.makeRpcCall('aria2.addUri', [
                [downloadUrl],
                options
            ]);

            if (response && response.result) {
                const taskId = response.result;
                this.activeTasks.set(taskId, {
                    id: taskId,
                    url: downloadUrl,
                    savePath: savePath,
                    fileName: fileName,
                    status: 'pending',
                    progress: 0,
                    speed: 0,
                    totalSize: 0,
                    completedSize: 0,
                    error: null
                });

                console.log('✅ 下载任务已添加:', taskId);
                return taskId;
            }
        } catch (error) {
            console.error('❌ 添加下载任务失败:', error);
            throw error;
        }
    }

    /**
     * 获取任务状态
     * @param {string} taskId - 任务ID
     * @returns {Promise<Object>} 任务状态信息
     */
    async getTaskStatus(taskId) {
        try {
            const response = await this.makeRpcCall('aria2.tellStatus', [taskId]);
            
            if (response && response.result) {
                const status = response.result;
                const taskInfo = {
                    id: taskId,
                    status: status.status,
                    progress: 0,
                    speed: parseInt(status.downloadSpeed) || 0,
                    totalSize: parseInt(status.totalLength) || 0,
                    completedSize: parseInt(status.completedLength) || 0,
                    error: status.errorCode !== '0' ? status.errorMessage : null
                };

                // 计算进度百分比
                if (taskInfo.totalSize > 0) {
                    taskInfo.progress = Math.round((taskInfo.completedSize / taskInfo.totalSize) * 100);
                }

                // 更新活跃任务信息
                if (this.activeTasks.has(taskId)) {
                    const existingTask = this.activeTasks.get(taskId);
                    Object.assign(existingTask, taskInfo);
                }

                return taskInfo;
            }
        } catch (error) {
            console.error('❌ 获取任务状态失败:', error);
            throw error;
        }
    }

    /**
     * 暂停任务
     * @param {string} taskId - 任务ID
     */
    async pauseTask(taskId) {
        try {
            await this.makeRpcCall('aria2.pause', [taskId]);
            console.log('⏸️ 任务已暂停:', taskId);
        } catch (error) {
            console.error('❌ 暂停任务失败:', error);
            throw error;
        }
    }

    /**
     * 继续任务
     * @param {string} taskId - 任务ID
     */
    async resumeTask(taskId) {
        try {
            await this.makeRpcCall('aria2.unpause', [taskId]);
            console.log('▶️ 任务已继续:', taskId);
        } catch (error) {
            console.error('❌ 继续任务失败:', error);
            throw error;
        }
    }

    /**
     * 删除任务
     * @param {string} taskId - 任务ID
     */
    async removeTask(taskId) {
        try {
            await this.makeRpcCall('aria2.remove', [taskId]);
            this.activeTasks.delete(taskId);
            console.log('🗑️ 任务已删除:', taskId);
        } catch (error) {
            console.error('❌ 删除任务失败:', error);
            throw error;
        }
    }

    /**
     * 获取所有活跃任务
     * @returns {Promise<Array>} 活跃任务列表
     */
    async getActiveTasks() {
        try {
            const response = await this.makeRpcCall('aria2.tellActive');
            
            if (response && response.result) {
                return response.result.map(task => ({
                    id: task.gid,
                    status: task.status,
                    progress: task.totalLength > 0 ? 
                        Math.round((task.completedLength / task.totalLength) * 100) : 0,
                    speed: parseInt(task.downloadSpeed) || 0,
                    totalSize: parseInt(task.totalLength) || 0,
                    completedSize: parseInt(task.completedLength) || 0,
                    fileName: task.files && task.files[0] ? 
                        task.files[0].path.split('/').pop() : '未知文件'
                }));
            }
        } catch (error) {
            console.error('❌ 获取活跃任务失败:', error);
            return [];
        }
    }

    /**
     * 开始状态监控
     */
    startStatusMonitoring() {
        if (this.statusUpdateInterval) {
            clearInterval(this.statusUpdateInterval);
        }

        this.statusUpdateInterval = setInterval(async () => {
            try {
                // 首先检查连接状态
                const isConnected = await this.checkConnection();
                
                if (isConnected) {
                    // 只有在连接正常时才更新任务状态
                    await this.updateAllTaskStatuses();
                }
            } catch (error) {
                console.error('状态监控更新失败:', error);
                // 连接失败时停止监控
                this.isConnected = false;
                this.stopStatusMonitoring();
            }
        }, 2000); // 每2秒检查一次连接状态
    }

    /**
     * 停止状态监控
     */
    stopStatusMonitoring() {
        if (this.statusUpdateInterval) {
            clearInterval(this.statusUpdateInterval);
            this.statusUpdateInterval = null;
        }
    }

    /**
     * 更新所有任务状态
     */
    async updateAllTaskStatuses() {
        for (const [taskId, task] of this.activeTasks) {
            try {
                const status = await this.getTaskStatus(taskId);
                
                // 触发状态更新事件
                this.dispatchStatusUpdate(taskId, status);
                
                // 如果任务完成或出错，从活跃列表中移除
                if (status.status === 'complete' || status.status === 'error') {
                    this.activeTasks.delete(taskId);
                }
            } catch (error) {
                console.error(`更新任务${taskId}状态失败:`, error);
            }
        }
    }

    /**
     * 分发状态更新事件
     * @param {string} taskId - 任务ID
     * @param {Object} status - 状态信息
     */
    dispatchStatusUpdate(taskId, status) {
        const event = new CustomEvent('motrixStatusUpdate', {
            detail: { taskId, status }
        });
        window.dispatchEvent(event);
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 格式化下载速度
     * @param {number} bytesPerSecond - 每秒字节数
     * @returns {string} 格式化后的速度
     */
    formatSpeed(bytesPerSecond) {
        return this.formatFileSize(bytesPerSecond) + '/s';
    }

    /**
     * 检查Motrix连接状态
     * @returns {boolean} 是否已连接
     */
    isMotrixConnected() {
        return this.isConnected;
    }

    /**
     * 重新连接Motrix
     */
    async reconnect() {
        this.isConnected = false;
        return await this.initializeConnection();
    }
}

// 创建全局Motrix控制器实例
window.motrixController = new MotrixController();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MotrixController;
}
