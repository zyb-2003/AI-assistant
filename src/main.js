// src/main.js
// 【代码作用】这是项目的入口文件，Vue应用从这里开始启动

// 【代码作用】导入Vue的createApp方法，用于创建应用实例
import { createApp } from 'vue'

// 【代码作用】导入Pinia的createPinia方法，用于创建状态管理实例
import { createPinia } from 'pinia'

// 【代码作用】导入根组件App
import App from './App.vue'

// 【代码作用】导入全局样式
import './style.css'

// 【代码作用】创建Vue应用实例
const app = createApp(App)

// 【代码作用】注册Pinia插件，让整个应用都能使用Pinia状态管理
app.use(createPinia())

// 【代码作用】将应用挂载到id为'app'的DOM元素上
// 这个元素在index.html里定义
app.mount('#app')

// 【对接后端】真实项目中可能需要的配置

// 1. 导入路由
// import router from './router'

// 2. 导入UI组件库（如Element Plus）
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'

// 3. 导入全局样式
// import './styles/index.scss'

// 4. 注册插件
// app.use(router)
// app.use(ElementPlus)

// 5. 全局错误处理
// app.config.errorHandler = (err, vm, info) => {
//   console.error('全局错误:', err, info)
// }