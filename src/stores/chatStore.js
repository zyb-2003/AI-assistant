// src/stores/chatStore.js
// 导入Pinia的defineStore方法，用于创建状态管理仓库
import { defineStore } from "pinia";
import request from '../utils/request'
import WebSocketManager from '../utils/websocket' // 导入WebSocket管理器

// 定义状态管理仓库store
// 创建一个名为'chat'的store，用于管理聊天相关的所有数据和方法
export const useChatStore = defineStore('chat', {
    // state--响应式数据
    state: () => {
        const saved = localStorage.getItem('chat-data');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            sessions: [], //会话列表，每个会话包含多条消息
            currentSessionId: null, //当前会话的ID
            loading: false, //是否正在等待AI回复
            loadingMore: false, // 新增：是否正在加载更多
            // ws: null, // WebSocket实例
            // streamingMessage: '', // 正在流式输出的消息
            // currentStreamingId: null // 当前正在流式输出的消息ID
        }
    },

    // getters--计算属性
    getters: {
        //获取当前会话的消息列表
        currentMessages: (state) => {
            const session = state.sessions.find(s => s.id === state.currentSessionId);
            if (session) {
                return session.messages;
            } else {
                return [];
            }
        },

        //获取按更新时间排序的会话列表（最新的在前面）
        sortedSessions: (state) => {
            return [...state.sessions].sort((a, b) => b.updatedAt - a.updatedAt)
        },
        currentSession: (state) => {
            return state.sessions.find(s => s.id === state.currentSessionId)
        }
    },

    // actions - 方法（可异步）
    actions: {
        //新建会话
        newSession() {
            this.loading = false; // 新建会话时重置loading状态
            const session = {
                id: Date.now(),
                title: '新对话',
                messages: [],
                createAt: Date.now(),
                updatedAt: Date.now(),
                noMoreMessages: false, // 新增：是否没有更多历史消息
                page: 1 // 新增：当前页码（如果用分页）
            };
            this.sessions.push(session);
            this.currentSessionId = session.id;
            this.saveToStorage();
        },

        //切换当前会话
        switchSession(id) {
            this.loading = false; // 切换会话时重置loading状态
            this.currentSessionId = id;
            this.saveToStorage();
        },

        //初始化websocket
        initWebSocket() {
            if (this.ws) return;
            //创建WebSocket连接
            const wsManager = new WebSocketManager('wss://cloud.infini-ai.com/maas/v1/chat/completions/stream');
            // 设置API Key（WebSocket通过URL参数传递）
            const apiKey =
                import.meta.env.VITE_INFINI_API_KEY
            if (apiKey) {
                wsManager.url += `?api_key=${apiKey}`
            }
            // 监听消息
            wsManager.onMessage((data) => {
                this.handleStreamMessage(data)
            })

            // 连接
            wsManager.connect()
            this.ws = wsManager
        },

        //处理流式消息
        handleStreamMessage(data) {
            const session = this.sessions.find(s => s.id === this.currentSessionId)
            if (!session) return
                // 如果是流式输出的token
            if (data.type === 'token') {
                // 查找当前正在输出的消息
                let currentMsg = session.messages.find(m => m.id === this.currentStreamingId)

                if (!currentMsg) {
                    // 创建新的消息
                    currentMsg = {
                        id: data.messageId || Date.now(),
                        role: 'assistant',
                        content: '',
                        time: new Date().toLocaleTimeString(),
                        isStreaming: true
                    }
                    session.messages.push(currentMsg)
                    this.currentStreamingId = currentMsg.id
                }

                // 追加token
                currentMsg.content += data.token
                this.saveToStorage()
            }

            // 如果是流式输出结束
            if (data.type === 'end') {
                const msg = session.messages.find(m => m.id === data.messageId)
                if (msg) {
                    msg.isStreaming = false
                }
                this.currentStreamingId = null
                this.loading = false
                this.saveToStorage()
            }
        },

        //发送消息（WebSocket版本）
        async sendMessageStream(content) {
            const session = this.sessions.find(s => s.id === this.currentSessionId);
            if (!session) return;

            // 创建用户消息
            const userMessage = {
                id: Date.now(),
                role: 'user',
                content: content,
                time: new Date().toLocaleTimeString()
            }
            session.messages.push(userMessage);

            if (session.messages.length == 1) {
                session.title = content.slice(0, 15) + (content.length > 15 ? '...' : '');
            }

            session.updatedAt = Date.now();
            this.loading = true;
            this.saveToStorage();

            // 确保WebSocket已连接
            if (!this.ws) {
                this.initWebSocket()
                    // 等待连接建立
                await new Promise(resolve => setTimeout(resolve, 1000))
            }

            // 通过WebSocket发送消息
            this.ws.send({
                type: 'chat',
                model: 'deepseek-r1',
                messages: [
                    { role: 'user', content: content }
                ],
                stream: true // 启用流式输出
            })
        },

        //清理WebSocket连接
        cleanupWebSocket() {
            if (this.ws) {
                this.ws.close()
                this.ws = null
            }
            console.log('WebSocket已清理')
        },

        //http版本： 发送消息， 等待ai回复
        async sendMessage(content) {
            const session = this.sessions.find(s => s.id === this.currentSessionId);
            if (!session) return;

            //创建用户消息对象
            const userMessage = {
                id: Date.now(),
                role: 'user',
                content: content,
                time: new Date().toLocaleTimeString()
            }
            session.messages.push(userMessage);

            if (session.messages.length == 1) {
                session.title = content.slice(0, 15) + (content.length > 15 ? '...' : '');
            }

            session.updatedAt = Date.now();
            this.loading = true;
            this.saveToStorage();
            try {
                // ✅ 调用无问芯穹的AI对话接口
                const response = await request.post('/chat/completions', {
                    model: 'deepseek-r1', // 使用DeepSeek R1模型
                    messages: [
                        { role: 'user', content: content }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })

                // ✅ 获取AI回复
                const aiReply = response.choices[0].message.content

                const aiMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: aiReply, // 这才是真正的AI回答！
                    time: new Date().toLocaleTimeString()
                }
                session.messages.push(aiMessage)

                console.log('AI回复:', aiReply)

            } catch (error) {
                console.error('AI对话失败', error)

                // 友好的错误提示
                const errorMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: '抱歉，我现在有点忙，请稍后再试。',
                    time: new Date().toLocaleTimeString(),
                    isError: true
                }
                session.messages.push(errorMessage)

            } finally {
                this.loading = false
                this.saveToStorage()
            }
            /* ========== API调用结束 ========== */
        },

        //删除会话
        deleteSession(id) {
            //删除会话
            this.sessions = this.sessions.filter(s => s.id !== id);
            if (this.currentSessionId === id) {
                this.currentSessionId = null;
            }
            this.saveToStorage();
        },

        saveToStorage() {
            localStorage.setItem('chat-data', JSON.stringify({
                sessions: this.sessions,
                currentSessionId: this.currentSessionId,
                loading: this.loading
            }))
        },
        // 新增：加载更多历史消息
        async loadMoreMessages() {
            const session = this.sessions.find(s => s.id === this.currentSessionId);
            if (!session) return;

            // 防止重复加载
            if (this.loadingMore) return;

            // 如果没有更多数据了
            if (session.noMoreMessages) return;

            this.loadingMore = true;

            try {
                // 获取当前最早的消息ID
                const earliestMsg = session.messages[0];
                if (!earliestMsg) { beforeId = null; } else { beforeId = earliestMsg.id; }

                // ✅ 这里改成你的真实API调用
                // const response = await request.get('/messages', {
                //     params: {
                //         sessionId: this.currentSessionId,
                //         before: beforeId,
                //         limit: 20
                //     }
                // })
                // const olderMessages = response.data

                // 模拟数据（测试用）
                await new Promise(resolve => setTimeout(resolve, 1000));
                const olderMessages = [{
                        id: Date.now() - 100000,
                        role: 'user',
                        content: '这是更早的历史消息',
                        time: new Date().toLocaleTimeString()
                    },
                    {
                        id: Date.now() - 200000,
                        role: 'assistant',
                        content: '是的，这是更早的回复',
                        time: new Date().toLocaleTimeString()
                    }
                ];

                if (olderMessages.length === 0) {
                    // 没有更多数据了
                    session.noMoreMessages = true;
                } else {
                    // 将更早的消息插入到列表最前面
                    session.messages.unshift(...olderMessages);
                }

            } catch (error) {
                console.error('加载历史消息失败:', error);
            } finally {
                this.loadingMore = false;
                this.saveToStorage();
            }
        },
    }
})