// src/utils/websocket.js
// WebSocket管理类，处理连接、心跳、重连
class WebSocketManager {
    // 构造函数，初始化WebSocket连接
    constructor(url) {
            this.url = url;
            this.ws = null;
            this.reconnectAttempts = 0
            this.maxReconnectAttempts = 5
            this.reconnectDelay = 1000 // 初始重连延迟1秒
            this.messageHandlers = [] // 消息处理器
            this.heartbeatInterval = null
            this.isConnected = false
        }
        // 连接WebSocket
    connect() {
            try {
                this.ws = new WebSocket(this.url)
                this.setupListeners()
            } catch (error) {
                console.error('WebSocket连接失败:', error)
                this.reconnect()
            }
        }
        // 设置监听器
    setupListeners() {
            // 监听连接成功
            this.ws.open = () => {
                    console.log('✅ WebSocket连接成功')
                    this.isConnected = true
                    this.reconnectAttempts = 0
                    this.reconnectDelay = 1000
                    this.startHeartbeat()
                }
                // 监听消息
            this.ws.onmessage = (event) => {
                    const data = JSON.parse(event.data)
                    console.log('📩 收到WebSocket消息:', data)
                        //触发所有处理器
                    this.messageHandlers.forEach(handler => handler(data))
                }
                // 监听关闭
            this.ws.onclose = (event) => {
                    console.log('❌ WebSocket连接关闭:', event)
                    this.isConnected = false
                    this.stopHeartbeat()
                    this.reconnect()
                }
                // 监听错误
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket连接错误:', error)
                this.ws.close()
            }
        }
        //发送消息
    sendMessage(message) {
            if (this.ws && this.isConnected) {
                this.ws.send(JSON.stringify(message))
            } else {
                console.log('❌ WebSocket连接未建立')
            }
        }
        // 添加消息处理器
    onMessage(handler) {
            this.messageHandlers.push(handler)
        }
        // 移除消息处理器
    offMessage(handler) {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
        }
        //开始心跳
    startHeartbeat() {
            this.heartbeatInterval = setInterval(() => {
                if (this.isConnected) {
                    this.send({ type: 'ping' })
                }
            }, 3000)
        }
        // 停止心跳
    stopHeartbeat() {
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval)
                this.heartbeatInterval = null
            }
        }
        // 重连（指数退避）
    reconnect() {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('❌ WebSocket重连次数超过限制')
                return
            }
            setTimeout(() => {
                console.log(`尝试重连 (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)
                this.reconnectAttempts++
                    this.reconnectDelay *= 2
                this.connect()
            }, this.reconnectDelay)
        }
        // 关闭WebSocket连接
    close() {
        this.stopHeartbeat()
        if (this.ws) {
            this.ws.close()
        }
    }

}
export default WebSocketManager