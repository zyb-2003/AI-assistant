// src/utils/request.js
import axios from 'axios'

// ✅ 使用无问芯穹的baseURL
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://cloud.infini-ai.com/maas/v1',
    timeout: 120000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器 - 添加API Key
request.interceptors.request.use(
    config => {
        const apiKey =
            import.meta.env.VITE_INFINI_API_KEY
        if (apiKey) {
            config.headers['Authorization'] = `Bearer ${apiKey}`
        }
        console.log('🌐 发送请求:', config.url, config.data)
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        console.log('✅ 收到响应:', response.data)
        return response.data
    },
    error => {
        console.error('❌ 请求失败:', error.message)
        alert('网络连接失败')
        return Promise.reject(error)
    }
)

export default request