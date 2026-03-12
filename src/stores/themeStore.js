// src/stores/themeStore.js
// 【代码作用】独立的状态管理模块，管理主题切换

import { defineStore } from 'pinia'

// 【面试必考+手写】定义theme store
export const useThemeStore = defineStore('theme', {

        // 【面试必考+手写】state - 响应式数据
        state: () => ({
            // 【核心理解】从localStorage读取主题，实现持久化
            // 用户刷新页面后主题不会重置
            theme: localStorage.getItem('theme') || 'light'
        }),

        // 【面试必考+手写】getters - 计算属性
        getters: {
            // 判断是否是暗色主题
            isDark: (state) => state.theme === 'dark',

            // 获取主题对应的图标
            themeIcon: (state) => state.theme === 'light' ? '☀️' : '🌙'
        },

        // 【面试必考+手写】actions - 方法
        actions: {
            // 切换主题
            toggleTheme() {
                // 切换主题：light -> dark, dark -> light
                this.theme = this.theme === 'light' ? 'dark' : 'light'

                // 【核心理解】保存到localStorage
                localStorage.setItem('theme', this.theme)

                // 【核心理解】给html标签设置data-theme属性，用于CSS变量
                // 这样所有使用CSS变量的地方都会自动更新
                document.documentElement.setAttribute('data-theme', this.theme)
                    /*
                    // 【对接后端】从后端获取用户主题偏好
                    async fetchUserTheme() {
                        const response = await request.get('/user/preferences')
                        this.theme = response.theme
                        document.documentElement.setAttribute('data-theme', this.theme)
                    }

                    // 保存主题到后端
                    async saveTheme() {
                        await request.post('/user/preferences', {
                        theme: this.theme
                    })
                    }
                    */
            }
        }
    })
    // // src/stores/themeStore.js
    // // 【代码作用】独立的状态管理模块，管理主题切换
    // // 【响应式优化】支持系统主题检测、主题持久化、媒体查询同步

// import { defineStore } from 'pinia'
// import { watch } from 'vue'

// // 【面试必考+手写】定义theme store
// export const useThemeStore = defineStore('theme', {

//     // 【面试必考+手写】state - 响应式数据
//     state: () => ({
//         // 【核心理解】从localStorage读取主题，实现持久化
//         // 用户刷新页面后主题不会重置
//         // 【响应式优化】优先读取localStorage，其次读取系统主题
//         theme: (() => {
//             const savedTheme = localStorage.getItem('theme')
//             if (savedTheme) return savedTheme

//             // 检查系统主题偏好
//             if (typeof window !== 'undefined' && window.matchMedia) {
//                 return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
//             }

//             return 'light' // 默认值
//         })(),

//         // 【响应式优化】新增：记录是否跟随系统主题
//         followSystem: !localStorage.getItem('theme'), // 如果没有手动设置过主题，则默认跟随系统

//         // 【响应式优化】新增：系统主题状态
//         systemTheme: 'light',

//         // 【响应式优化】新增：主题配置
//         themeConfig: {
//             light: {
//                 name: '浅色',
//                 icon: '🌙',
//                 description: '适合白天使用'
//             },
//             dark: {
//                 name: '深色',
//                 icon: '☀️',
//                 description: '适合夜间使用'
//             },
//             auto: {
//                 name: '自动',
//                 icon: '🔄',
//                 description: '跟随系统主题'
//             }
//         }
//     }),

//     // 【面试必考+手写】getters - 计算属性
//     getters: {
//         // 判断是否是暗色主题
//         isDark: (state) => {
//             if (state.followSystem) {
//                 return state.systemTheme === 'dark'
//             }
//             return state.theme === 'dark'
//         },

//         // 获取主题对应的图标
//         themeIcon: (state) => {
//             if (state.followSystem) {
//                 return state.themeConfig.auto.icon
//             }
//             return state.theme === 'light' ?
//                 state.themeConfig.light.icon :
//                 state.themeConfig.dark.icon
//         },

//         // 【响应式优化】获取当前主题名称
//         currentThemeName: (state) => {
//             if (state.followSystem) {
//                 return state.themeConfig.auto.name
//             }
//             return state.theme === 'light' ?
//                 state.themeConfig.light.name :
//                 state.themeConfig.dark.name
//         },

//         // 【响应式优化】获取当前主题描述
//         currentThemeDescription: (state) => {
//             if (state.followSystem) {
//                 return state.themeConfig.auto.description
//             }
//             return state.theme === 'light' ?
//                 state.themeConfig.light.description :
//                 state.themeConfig.dark.description
//         },

//         // 【响应式优化】获取所有可用主题
//         availableThemes: (state) => Object.keys(state.themeConfig),

//         // 【响应式优化】获取实际应用的主题（用于CSS变量）
//         appliedTheme: (state) => {
//             if (state.followSystem) {
//                 return state.systemTheme
//             }
//             return state.theme
//         }
//     },

//     // 【面试必考+手写】actions - 方法
//     actions: {
//         // 切换主题
//         toggleTheme() {
//             if (this.followSystem) {
//                 // 如果当前是跟随系统，切换到手动模式并使用系统当前主题
//                 this.followSystem = false
//                 this.theme = this.systemTheme
//             } else {
//                 // 切换主题：light -> dark, dark -> light
//                 this.theme = this.theme === 'light' ? 'dark' : 'light'
//             }

//             this.saveTheme()
//         },

//         // 【响应式优化】设置指定主题
//         setTheme(theme) {
//             if (theme === 'auto') {
//                 this.followSystem = true
//             } else {
//                 this.followSystem = false
//                 this.theme = theme
//             }
//             this.saveTheme()
//         },

//         // 【响应式优化】切换是否跟随系统
//         toggleFollowSystem() {
//             this.followSystem = !this.followSystem
//             this.saveTheme()
//         },

//         // 【核心理解】保存主题设置
//         saveTheme() {
//             if (this.followSystem) {
//                 // 如果跟随系统，从localStorage中移除手动设置
//                 localStorage.removeItem('theme')
//                 this.applyTheme(this.systemTheme)
//             } else {
//                 // 保存手动设置的主题
//                 localStorage.setItem('theme', this.theme)
//                 this.applyTheme(this.theme)
//             }
//         },

//         // 【核心理解】应用主题到DOM
//         applyTheme(theme) {
//             // 给html标签设置data-theme属性，用于CSS变量
//             document.documentElement.setAttribute('data-theme', theme)

//             // 【响应式优化】设置meta主题色，适配移动端浏览器
//             const themeColor = theme === 'dark' ? '#1a1a1a' : '#ffffff'
//             let metaThemeColor = document.querySelector('meta[name="theme-color"]')

//             if (!metaThemeColor) {
//                 metaThemeColor = document.createElement('meta')
//                 metaThemeColor.setAttribute('name', 'theme-color')
//                 document.head.appendChild(metaThemeColor)
//             }

//             metaThemeColor.setAttribute('content', themeColor)
//         },

//         // 【响应式优化】监听系统主题变化
//         watchSystemTheme() {
//             if (typeof window === 'undefined' || !window.matchMedia) return

//             const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

//             // 更新当前系统主题
//             const updateSystemTheme = (e) => {
//                 this.systemTheme = e.matches ? 'dark' : 'light'

//                 // 如果设置了跟随系统，立即应用
//                 if (this.followSystem) {
//                     this.applyTheme(this.systemTheme)
//                 }
//             }

//             // 初始设置
//             updateSystemTheme(mediaQuery)

//             // 监听变化
//             mediaQuery.addEventListener('change', updateSystemTheme)

//             // 返回清理函数
//             return () => {
//                 mediaQuery.removeEventListener('change', updateSystemTheme)
//             }
//         },

//         // 【响应式优化】初始化主题
//         initialize() {
//             // 初始应用主题
//             this.applyTheme(this.appliedTheme)

//             // 开始监听系统主题变化
//             return this.watchSystemTheme()
//         },

//         // 【响应式优化】获取主题CSS变量
//         getThemeVariables(theme = this.appliedTheme) {
//             const themes = {
//                 light: {
//                     '--bg-primary': '#ffffff',
//                     '--bg-secondary': '#f8f9fa',
//                     '--text-primary': '#333333',
//                     '--text-secondary': '#666666',
//                     '--border-color': '#e0e0e0',
//                     '--primary-color': '#2196f3',
//                     '--primary-hover': '#1976d2',
//                     '--shadow-color': 'rgba(0, 0, 0, 0.1)',
//                     '--message-user-bg': '#e3f2fd',
//                     '--message-ai-bg': '#f5f5f5'
//                 },
//                 dark: {
//                     '--bg-primary': '#1a1a1a',
//                     '--bg-secondary': '#2d2d2d',
//                     '--text-primary': '#ffffff',
//                     '--text-secondary': '#cccccc',
//                     '--border-color': '#444444',
//                     '--primary-color': '#64b5f6',
//                     '--primary-hover': '#90caf9',
//                     '--shadow-color': 'rgba(0, 0, 0, 0.3)',
//                     '--message-user-bg': '#0d47a1',
//                     '--message-ai-bg': '#424242'
//                 }
//             }

//             return themes[theme] || themes.light
//         },

//         // 【响应式优化】响应式主题调整（基于屏幕尺寸）
//         getResponsiveThemeAdjustments() {
//             if (typeof window === 'undefined') return {}

//             const width = window.innerWidth

//             if (width < 768) { // 移动端
//                 return {
//                     '--font-size-base': '14px',
//                     '--spacing-unit': '12px',
//                     '--border-radius': '8px'
//                 }
//             } else if (width < 1024) { // 平板
//                 return {
//                     '--font-size-base': '15px',
//                     '--spacing-unit': '16px',
//                     '--border-radius': '12px'
//                 }
//             } else { // 桌面端
//                 return {
//                     '--font-size-base': '16px',
//                     '--spacing-unit': '20px',
//                     '--border-radius': '16px'
//                 }
//             }
//         },

//         // 【响应式优化】更新CSS变量
//         updateCSSVariables() {
//             const root = document.documentElement

//             // 应用主题变量
//             const themeVars = this.getThemeVariables()
//             Object.entries(themeVars).forEach(([key, value]) => {
//                 root.style.setProperty(key, value)
//             })

//             // 应用响应式调整
//             const responsiveVars = this.getResponsiveThemeAdjustments()
//             Object.entries(responsiveVars).forEach(([key, value]) => {
//                 root.style.setProperty(key, value)
//             })
//         }
//     }
// })

// // 【响应式优化】在组件中使用示例
// /*
// // 在Vue组件中：
// import { useThemeStore } from '@/stores/themeStore'
// import { onMounted, onUnmounted, watch } from 'vue'

// const themeStore = useThemeStore()

// onMounted(() => {
//   // 初始化主题
//   const cleanup = themeStore.initialize()

//   // 监听窗口大小变化，更新响应式变量
//   const handleResize = () => themeStore.updateCSSVariables()
//   window.addEventListener('resize', handleResize)

//   onUnmounted(() => {
//     cleanup?.()
//     window.removeEventListener('resize', handleResize)
//   })
// })

// // 监听主题变化
// watch(() => themeStore.appliedTheme, () => {
//   themeStore.updateCSSVariables()
// })
// */