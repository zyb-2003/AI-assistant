<!-- 
  组件名称：App
  作用：根组件，整合所有子组件
  包含：左侧会话列表、右侧聊天区域
-->
<template>
  <div class="app">
    <!-- ========== 左侧侧边栏：会话列表 ========== -->
    <div class="left">
      <div class="sidebar">
        <div style="display:flex;flex-direction: row;">
          <h2>AI助手</h2>
          <button @click="toggleTheme" class="theme-btn">{{ themeIcon }}</button>
        </div>    
        <button class="new-btn" @click="newSession">+新建对话</button>
        <div class="search-box">
          <div class="search-container">
            <!--搜索框v-model双向绑定 -->
          <input 
            v-model="searchText" 
            placeholder="搜索对话..."
            class="search-input"
            ref="searchInput"
          />
          <!--清除按钮-->
          <button class="clear-btn" @click="clearSearch" v-show="searchText">X</button>
          </div>
        
        </div>
      </div>
      <div class="session-list">
        <!--遍历sortedSessions数组，为每个会话生成一个div-->
        <div
          v-for="session in searchResults"
          :key="session.id"
          class="session-item"
          :class="{ active: currentSessionId === session.id }"
          @click="()=>switchSession(session.id)"
        >
          <span class="session-title">{{ session.title }}</span>
          <span class="session-time">{{ formatTime(session.updatedAt) }}</span>
          <button class="delete-btn" @click="()=>deleteSession(session.id)" v-show="currentSessionId==session.id">X</button>
        </div>
      </div>
    </div>

    <!-- ========== 右侧主聊天区 ========== -->
    <div class="main">
      <!--消息列表区域-->
      <div class="messages-container" ref="messageList">
        <!-- 顶部加载更多提示 -->
  <div v-if="showLoadingMore" class="loading-more">
    <div class="loading-spinner-small"></div>
    <span>加载历史消息中...</span>
  </div>
  
  <!-- 没有更多数据的提示 -->
  <div v-if="store.currentSession?.noMoreMessages" class="no-more">
    —— 没有更早的消息了 ——
  </div>
        <!--遍历currentMessages数组，为每条消息生成ChatMessage组件-->
        <ChatMessage v-for="msg in currentMessages" :key="msg.id" :message="msg"/>
        <!-- ✅ 正确：在消息列表的最后显示加载动画 -->
        <LoadingSpinner v-if="loading" />
      </div>
      <!-- 输入框容器 -->
      <div class="chat-input-wrapper">
        <ChatInput :loading="loading" @send="sendMessage" class="chat-input"/>
      </div>
    </div>
  </div>
</template>

<script setup>
  //导入Vue API
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import debounce from 'lodash/debounce'  // 只导入 debounce，减小打包体积
  import throttle from 'lodash/throttle'  // 导入节流
  //导入store和组件
  import { useChatStore } from './stores/chatStore'
  import ChatMessage from './components/ChatMessage.vue';
  import ChatInput from './components/ChatInput.vue';
  import { useThemeStore } from './stores/themeStore'
  import LoadingSpinner from './components/LoadingSpinner.vue'
  //获取store实例
  const store = useChatStore()
  //ref获取DOM元素
  //创建一个响应式引用，指向模板中ref="messageList"的元素
  const messageList = ref(null)
  //computed 计算属性
  //从store中获取数据，用computed包装后变成响应式
  //这样当store中的数据变化时，这些变量也会自动更新
  const sortedSessions = computed(() => store.sortedSessions)
  const currentMessages = computed(() => store.currentMessages)
  const loading = computed(() => store.loading)
  const currentSessionId = computed(() => store.currentSessionId)

  //主题切换
  const themeStore = useThemeStore()
  const themeIcon = computed(() => themeStore.themeIcon)
  const toggleTheme = () => themeStore.toggleTheme()

  //搜索框
  // 1. 定义响应式数据
  const searchText = ref('')
  const searchResults = ref([])  // 存储搜索结果
  const isSearching = ref(false)  // 搜索状态
  //2. 定义搜索函数，使用debounce防抖
  const debouncedSearch = debounce(async (keyword) => {
  if (!keyword.trim()) {
    // 关键词为空，显示所有会话
    searchResults.value = sortedSessions.value
    isSearching.value = false
    return
  }
  
  isSearching.value = true
  try {
    // 这里可以调用后端API，现在先用前端过滤模拟
    const filtered = sortedSessions.value.filter(s => 
      s.title.toLowerCase().includes(keyword.toLowerCase())
    )
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    searchResults.value = filtered
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    isSearching.value = false
  }
}, 500)  // 500ms 防抖

// 3. 监听搜索框变化
watch(searchText, (newVal) => {
  debouncedSearch(newVal)
})

  // const filteredSessions = computed(() => {
  //   if (!searchText.value) {  
  //     return sortedSessions.value
  //   }
  //   return sortedSessions.value.filter(s=>s.title.toLowerCase().includes(searchText.value.toLowerCase()))
  // })
  const clearSearch = () => {
    searchText.value = ''
    //searchInput.value?.focus()
  }

// 是否显示"加载中"提示
const showLoadingMore = ref(false)

// 创建节流滚动处理函数
const handleScroll = throttle(() => {
    const container = messageList.value
    if (!container) return
    
    // 滚动到顶部时加载更多（scrollTop < 50px）
    if (container.scrollTop < 50) {
        // 检查是否正在加载
        if (!store.loadingMore && !store.loading) {
            console.log('触发加载更多历史消息')
            showLoadingMore.value = true
            store.loadMoreMessages().finally(() => {
                showLoadingMore.value = false
            })
        }
    }
}, 200)  // 200ms内最多执行一次

  //生命周期 onMounted
  //组件挂载到DOM后执行
  onMounted(() => {
    // 如果没有会话，自动创建一个
    if (store.sessions.length === 0) {
      store.newSession()
    }
     // 添加滚动监听
    if (messageList.value) {
        messageList.value.addEventListener('scroll', handleScroll)
    }
     // 🔥 关键：初始化搜索结果
  searchResults.value = sortedSessions.value
    /* ========== 【对接后端】真实项目中可能需要做的 ========== */
    // 1. 检查登录状态
    // const token = localStorage.getItem('token')
    // if (!token) {
    //   router.push('/login')
    // }
  
    // 2. 从后端加载用户数据
    // store.fetchUserSessions()
  
    // 3. 初始化WebSocket连接
    // store.initWebSocket()
  })
  // 监听 sortedSessions 变化（当新建会话时更新搜索结果）
watch(sortedSessions, (newVal) => {
  if (!searchText.value) {
    searchResults.value = newVal
  }
}, { immediate: true })
  // 切换会话时重置滚动位置
watch(currentSessionId, () => {
    setTimeout(() => {
        if (messageList.value) {
            messageList.value.scrollTop = messageList.value.scrollHeight
        }
    }, 100)
})
  //watch 监听
  //监听currentMessages的变化，当有新消息时自动滚动到底部
  watch(currentMessages,()=>{
    //setTimeout 确保DOM更新完成后再滚动
    //Vue更新DOM是异步的，直接滚动可能还没渲染完
    setTimeout(()=>{
      if (messageList.value) {
        //scrollTop设置滚动位置，scrollHeight是内容总高度
        //设置为scrollHeight就会滚动到底部
        messageList.value.scrollTop=messageList.value.scrollHeight
      }
    },100)
  },{ deep: true })  // 【代码作用】deep:true深度监听，监听对象内部的变化
  //调用store中的方法
  const newSession = () => store.newSession()
  const switchSession = (id) => store.switchSession(id)
  const sendMessage = (content) => store.sendMessage(content)
  const sendMessageStream = (content) => store.sendMessageStream(content)
  const deleteSession = (id) => {
    // 在组件里弹出确认框
    if (confirm('确定要删除这个会话吗？')) {
        store.deleteSession(id)  // 确认后才调用 store 的删除方法
    }
}
  //日期格式化函数
  //把时间戳转成可读的格式
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
  
    // 如果是今天，显示"今天 时:分"
    if (date.toDateString() === now.toDateString()) {
      return `今天 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }
  
    // 否则显示"月/日"
    return `${date.getMonth()+1}/${date.getDate()}`
  }
  //组件卸载时清理WebSocket
  onUnmounted(() => {
      store.cleanupWebSocket()
      if (messageList.value) {
        messageList.value.removeEventListener('scroll', handleScroll)
    }
  })
</script>

<style>
/* 【了解查文档】全局样式，没有scoped，影响所有组件 */

/* ========== 【重构】新增：CSS设计系统变量 ========== */
/* 🔵 新增：通过CSS变量建立完整的设计系统，便于统一管理和主题切换 */
:root {
  /* 颜色系统 - 统一管理所有颜色 */
  --primary-color: #2196f3;        /* 原：#2196f3 */
  --primary-hover: #1976d2;        /* 🔵 新增：悬停色 */
  --primary-light: #e3f2fd;        /* 原：#e3f2fd */
  --bg-light: #f8f9fa;             /* 原：#e1e1e1 修改为更柔和的灰色 */
  --bg-white: #ffffff;             /* 原：white */
  --text-primary: #333333;         /* 🔵 新增：主要文字色 */
  --text-muted: #999999;           /* 原：#999 */
  --border-color: #e0e0e0;         /* 原：#e0e0e0 */
  --border-light: #eeeeee;         /* 原：#eee */
  --bg-hover: #f0f0f0;             /* 原：#f0f0f0 */
  
  /* 间距系统 - 基于4px的网格系统 */
  /* 🔴 修改：所有固定px改为rem单位，实现响应式缩放 */
  --space-2: 0.125rem;   /* 2px -> 0.125rem */
  --space-4: 0.25rem;    /* 4px -> 0.25rem */
  --space-8: 0.5rem;     /* 8px -> 0.5rem */
  --space-12: 0.75rem;   /* 12px -> 0.75rem */
  --space-16: 1rem;      /* 16px -> 1rem */
  --space-20: 1.25rem;   /* 20px -> 1.25rem */
  --space-24: 1.5rem;    /* 24px -> 1.5rem */
  --space-32: 2rem;      /* 32px -> 2rem */
  
  /* 字体系统 - 使用rem单位实现字体缩放 */
  /* 🔴 修改：所有字体px改为rem单位 */
  --text-xs: 0.75rem;    /* 12px -> 0.75rem */
  --text-sm: 0.875rem;   /* 14px -> 0.875rem */
  --text-base: 1rem;     /* 16px -> 1rem */
  --text-lg: 1.125rem;   /* 18px -> 1.125rem */
  --text-xl: 1.25rem;    /* 20px -> 1.25rem */
  
  /* 圆角系统 - 统一管理所有圆角 */
  /* 🔴 修改：px改为rem单位 */
  --radius-sm: 0.25rem;  /* 4px -> 0.25rem */
  --radius-md: 0.5rem;   /* 8px -> 0.5rem */
  --radius-lg: 1rem;     /* 16px -> 1rem */
  --radius-xl: 1.5rem;   /* 24px -> 1.5rem */
  
  /* 阴影系统 - 统一管理所有阴影 */
  /* 🔵 新增：阴影使用相对单位 */
  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
  --shadow-md: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
  
  /* 响应式断点 - 统一管理断点 */
  /* 🔵 新增：响应式断点变量 */
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  /* 🔴 修改：16px -> var(--text-base) 使用CSS变量 */
  font-size: var(--text-base);
  /* 🔵 新增：行高优化 */
  line-height: 1.5;
  /* 🔵 新增：背景色使用变量 */
  background: var(--bg-light);
}

.app {
  display: flex;
  height: 100vh;
  /* 🔵 新增：宽度控制 */
  width: 100vw;
  /* 🔵 新增：防止内容溢出 */
  overflow: hidden;
  /* 🔵 新增：背景色使用变量 */
  background: var(--bg-white);
}

/* ========== 左侧侧边栏 ========== */
.left {
  /* 🔴 修改：260px -> 16.25rem (260/16) px转rem */
  width: 16.25rem;
  /* 🔴 修改：#e1e1e1 -> var(--bg-light) 使用颜色变量 */
  background: var(--bg-light);
  /* 🔴 修改：#eee -> var(--border-light) 使用颜色变量 */
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  height: 100%;
  /* 🔵 新增：防止侧边栏被压缩 */
  flex-shrink: 0;
  /* 🔵 新增：平滑过渡动画 */
  transition: width 0.3s ease;
}

.sidebar {
  /* 🔴 修改：260px -> 16.25rem 保持与.left一致 */
  width: 16.25rem;
  /* 🔴 修改：#eee -> var(--border-light) 使用颜色变量 */
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  /* 🔴 修改：20px -> var(--space-20) var(--space-16) 使用间距变量 */
  padding: var(--space-20) var(--space-16);
  /* 🔵 新增：居中布局 */
  align-items: center;
  /* 🔵 新增：使用gap替代margin */
  gap: var(--space-16);
  /* 🔴 修改：#eee -> var(--border-light) 使用颜色变量 */
  border-bottom: 1px solid var(--border-light);
  /* 🔴 修改：white -> var(--bg-white) 使用颜色变量 */
  background: var(--bg-white);
}

h2 {
  /* 🔴 修改：原代码中是通过style设置的，现在改为CSS控制 */
  /* 🔴 修改：24px -> var(--text-xl) 使用字体变量 */
  font-size: var(--text-xl);
  text-align: center;
  /* 🔴 修改：#2196f3 -> var(--primary-color) 使用颜色变量 */
  color: var(--primary-color);
  /* 🔵 新增：重置margin */
  margin: 0;
  /* 🔵 新增：字重优化 */
  font-weight: 600;
  /* 🔵 新增：行高优化 */
  line-height: 1.2;
}

.new-btn {
  /* 🔴 修改：6px 12px -> var(--space-8) var(--space-12) 使用间距变量 */
  padding: var(--space-8) var(--space-12);
  /* 🔴 修改：20px -> var(--space-20) 使用间距变量 */
  margin: var(--space-20);
  /* 🔴 修改：#070707 -> var(--primary-color) 使用颜色变量（原黑色改为品牌色） */
  background: var(--primary-color);
  /* 🔴 修改：white -> var(--bg-white) 使用颜色变量 */
  color: var(--bg-white);
  border: none;
  /* 🔴 修改：4px -> var(--radius-sm) 使用圆角变量 */
  border-radius: var(--radius-sm);
  cursor: pointer;
  /* 🔴 修改：13px -> var(--text-sm) 使用字体变量 */
  font-size: var(--text-sm);
  /* 🔵 新增：字重优化 */
  font-weight: 500;
  /* 🔵 新增：过渡动画 */
  transition: all 0.2s ease;
  /* 🔵 新增：触摸友好的最小高度 (44px) */
  min-height: 2.75rem;
  align-self: center;
}

/* 🔵 新增：按钮悬停效果 */
.new-btn:hover {
  /* 🔴 修改：#1976d2 -> var(--primary-hover) 使用颜色变量 */
  background: var(--primary-hover);
  /* 🔵 新增：微交互反馈 */
  transform: translateY(-1px);
  /* 🔵 新增：阴影效果 */
  box-shadow: var(--shadow-md);
}

.header-actions{
  display: flex;
  gap:0.5rem;
}

.theme-btn{
  width: 1.25rem;
  height: 1.25rem;
  border:none;
  border-radius: 50%;
  background:transparent;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.3s; /* 添加过渡效果 */
}

.theme-btn:hover {
  background: var(--hover-bg);
}

.search-box{
  width: 100%;
  padding: 0.625rem;
}

.search-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
  font-size: 0.875rem;
}

/* 输入框 - 关键：右侧内边距要给清除按钮留出空间 */
.search-input {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;  /* 右2.5rem给清除按钮 */
  border: 0.125rem solid var(--border-light);
  border-radius: 0.625rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
  background: var(--bg-white);
  color: var(--text-primary);
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.125rem rgba(33, 150, 243, 0.1);
}

/* 清除按钮 - 绝对定位在输入框的右端 */
.clear-btn {
  position: absolute;
  right: 0.5rem;  /* 距离输入框右侧8px */
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-muted);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 1;
}



/* 移动端适配 */
@media (max-width: 768px) {
  .search-box {
    padding: 0.5rem;
  }
  
  .search-input {
    padding: 0.375rem 2rem 0.375rem 1.75rem;
    font-size: 0.8125rem;
  }
  
  .search-icon {
    left: 0.625rem;
    font-size: 0.8125rem;
  }
  
  .clear-btn {
    right: 0.375rem;
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.875rem;
  }
}

/* ========== 右侧内容区域 ========== */
.right {
  flex: 1;
  display: flex;
}

/* 加载更多提示 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #999;
  font-size: 13px;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 没有更多数据提示 */
.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 确保滚动容器有足够高度 */
.messages-container {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  /* 🔴 修改：10px -> var(--space-12) 使用间距变量 */
  padding: var(--space-12);
  /* 🔵 新增：使用flex布局优化 */
  display: flex;
  flex-direction: column;
  /* 🔵 新增：使用gap替代margin-bottom */
  gap: var(--space-8);
}

.session-item {
  /* 🔴 修改：12px -> var(--space-12) 使用间距变量 */
  padding: var(--space-12);
  /* 🔴 修改：8px -> var(--space-8) 使用间距变量（注意：现在用gap控制，这里可保留向后兼容） */
  margin-bottom: var(--space-8);
  /* 🔴 修改：white -> var(--bg-white) 使用颜色变量 */
  background: var(--bg-white);
  /* 🔴 修改：8px -> var(--radius-md) 使用圆角变量 */
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  /* 🔴 修改：8px -> var(--space-8) 使用间距变量 */
  gap: var(--space-8);
  position: relative;
  border: 1px solid transparent;
  /* 🔵 新增：过渡动画 */
  transition: all 0.2s ease;
  /* 🔵 新增：触摸友好的最小高度 */
  min-height: 3rem;
}

/* 🔵 新增：悬停效果优化 */
.session-item:hover:not(.active) {
  /* 🔴 修改：#f0f0f0 -> var(--bg-hover) 使用颜色变量 */
  background: var(--bg-hover);
  /* 🔵 新增：微交互反馈 */
  transform: translateX(0.25rem);
  /* 🔵 新增：悬停时显示边框 */
  border-color: var(--border-color);
}

.session-item.active {
  /* 🔴 修改：#e3f2fd -> var(--primary-light) 使用颜色变量 */
  background: var(--primary-light);
  /* 🔴 修改：#2196f3 -> var(--primary-color) 使用颜色变量 */
  border-color: var(--primary-color);
  color: var(--primary-color);
  /* 🔵 新增：激活状态阴影 */
  box-shadow: var(--shadow-md);
  /* 🔵 新增：激活状态动画 */
  transform: translateX(0.5rem);
}

.session-title {
  flex: 1;
  /* 🔴 修改：14px -> var(--text-sm) 使用字体变量 */
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 🔵 新增：字重优化 */
  font-weight: 500;
  /* 🔵 新增：使用颜色变量 */
  color: var(--text-primary);
}

/* 🔵 新增：激活状态的标题样式 */
.session-item.active .session-title {
  color: var(--primary-color);
  font-weight: 600;
}

.session-time {
  /* 🔴 修改：12px -> var(--text-xs) 使用字体变量 */
  font-size: var(--text-xs);
  /* 🔴 修改：#999 -> var(--text-muted) 使用颜色变量 */
  color: var(--text-muted);
  /* 🔵 新增：防止换行 */
  white-space: nowrap;
  /* 🔵 新增：防止时间被压缩 */
  flex-shrink: 0;
}

.delete-btn {
  /* 🔴 修改：20px -> 1.25rem (20/16) px转rem */
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: none;
  background:var(--primary-color);
  /* 🔴 修改：#999 -> var(--text-muted) 使用颜色变量 */
  color: white;
  cursor: pointer;
}


.delete-btn:hover {
  background: #ff4444;
  color: white;
}

.empty {
  /* 🔴 修改：20px -> var(--space-20) 使用间距变量 */
  padding: var(--space-20);
  text-align: center;
  /* 🔴 修改：#999 -> var(--text-muted) 使用颜色变量 */
  color: var(--text-muted);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;  /* 为子元素提供定位上下文 */
  /* 🔵 新增：防止内容溢出 */
  min-height: 0;
  /* 🔵 新增：隐藏溢出内容 */
  overflow: hidden;
  /* 🔵 新增：背景色使用变量 */
  background: var(--bg-white);
}

.messages-container {
  flex: 1;  /* 占据除输入框外的所有空间 */
  overflow-y: auto;
  /* 🔴 修改：20px -> var(--space-20) 使用间距变量 */
  padding: var(--space-20);
  /* 🔴 修改：20px -> 动态计算的空间 为输入框留出更多空间 */
  padding-bottom: calc(var(--space-32) + var(--space-24));
  /* 🔵 新增：宽度包含边框和内边距 */
  width: 100%;
  box-sizing: border-box;
  /* 🔵 新增：平滑滚动 */
  scroll-behavior: smooth;
  /* 🔵 新增：背景色使用变量 */
  background: var(--bg-light);
}

/* ========== 【重构】新增：输入框包装器 ========== */
/* 🔵 新增：创建专门的包装器，更好控制输入框位置 */
.chat-input-wrapper {
  width: 100%;
  /* 🔴 修改：16px 20px -> var(--space-16) var(--space-20) 使用间距变量 */
  padding: var(--space-16) var(--space-20);
  /* 🔴 修改：white -> var(--bg-white) 使用颜色变量 */
  background: var(--bg-white);
  /* 🔴 修改：#eee -> var(--border-light) 使用颜色变量 */
  border-top: 1px solid var(--border-light);
  /* 🔴 修改：使用阴影变量 */
  box-shadow: var(--shadow-lg);
  /* 🔵 新增：粘性定位，始终在底部 */
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-sizing: border-box;
}

.chat-input {
  /* 🔴 修改：97% -> 100% 占满包装器宽度 */
  width: 100%;
  /* 🔵 新增：限制最大宽度，保持良好阅读体验 */
  max-width: 37.5rem;  /* 600px -> 37.5rem */
  /* 🔵 新增：水平居中 */
  margin: 0 auto;
  /* 🔴 修改：24px -> var(--radius-xl) 使用圆角变量 */
  border-radius: var(--radius-xl);
  /* 🔴 修改：#e0e0e0 -> var(--border-color) 使用颜色变量 */
  border: 1px solid var(--border-color);
  /* 🔴 修改：使用阴影变量 */
  box-shadow: var(--shadow-md);
  /* 🔴 修改：white -> var(--bg-white) 使用颜色变量 */
  background: var(--bg-white);
  /* 🔴 修改：#eee -> var(--border-light) 使用颜色变量 */
  border-top: 1px solid var(--border-light);
  /* 🔴 修改：16px 20px -> var(--space-16) var(--space-20) 使用间距变量 */
  padding: var(--space-16) var(--space-20);
  display: flex;
  /* 🔴 修改：12px -> var(--space-12) 使用间距变量 */
  gap: var(--space-12);
  /* 🔵 新增：底部对齐 */
  align-items: flex-end;
  box-sizing: border-box;
  /* 🔵 新增：过渡动画 */
  transition: all 0.2s ease;
}

/* 🔵 新增：输入框悬停效果 */
.chat-input:hover {
  border-color: #d0d0d0;
  box-shadow: var(--shadow-lg);
}

/* 🔵 新增：输入框聚焦效果 */
.chat-input:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.125rem rgba(33, 150, 243, 0.1);
}

/* ========== 【重构】新增：响应式设计 ========== */
/* 🔵 新增：平板端适配 (1024px及以下) */
@media (max-width: 1024px) {
  .left {
    /* 🔴 修改：缩小侧边栏宽度 */
    width: 14rem;
  }
  
  .sidebar {
    width: 14rem;
    /* 🔴 修改：调整内边距 */
    padding: var(--space-16) var(--space-12);
  }
  
  h2 {
    /* 🔴 修改：缩小字体大小 */
    font-size: var(--text-lg);
  }
  
  .chat-input {
    /* 🔴 修改：增大最大宽度占比 */
    max-width: 90%;
  }
}

/* 🔵 新增：移动端适配 (768px及以下) */
@media (max-width: 768px) {
  .app {
    /* 🔴 修改：改为垂直布局 */
    flex-direction: column;
  }
  
  .left {
    /* 🔴 修改：占满宽度 */
    width: 100%;
    /* 🔴 修改：自动高度 */
    height: auto;
    /* 🔴 修改：限制最大高度 */
    max-height: 40vh;
    /* 🔴 修改：移除右边框，添加底部边框 */
    border-right: none;
    border-bottom: 1px solid var(--border-light);
  }
  
  .sidebar {
    width: 100%;
    /* 🔴 修改：改为水平布局 */
    flex-direction: row;
    /* 🔴 修改：两端对齐 */
    justify-content: space-between;
    /* 🔴 修改：减小内边距 */
    padding: var(--space-12);
  }
  
  h2 {
    /* 🔴 修改：缩小字体大小 */
    font-size: var(--text-base);
  }
  
  .new-btn {
    /* 🔴 修改：移除外边距，调整内边距 */
    margin: 0;
    padding: var(--space-8) var(--space-12);
    /* 🔴 修改：缩小字体大小 */
    font-size: var(--text-xs);
  }
  
  .session-list {
    /* 🔴 修改：改为水平滚动布局 */
    flex-direction: row;
    /* 🔴 修改：水平滚动 */
    overflow-x: auto;
    overflow-y: hidden;
    /* 🔴 修改：减小内边距 */
    padding: var(--space-8);
    gap: var(--space-8);
  }
  
  .session-item {
    /* 🔴 修改：不伸缩，固定宽度 */
    flex: 0 0 auto;
    /* 🔴 修改：固定宽度 */
    width: 12rem;
    /* 🔴 修改：垂直布局 */
    flex-direction: column;
    align-items: flex-start;
    /* 🔴 修改：减小内边距 */
    padding: var(--space-8);
    /* 🔴 修改：右边距替代底部间距 */
    margin-right: var(--space-8);
    margin-bottom: 0;
    /* 🔴 修改：移除最小高度限制 */
    min-height: auto;
  }
  
  .session-title {
    /* 🔴 修改：缩小字体大小 */
    font-size: var(--text-xs);
    /* 🔴 修改：允许多行显示 */
    white-space: normal;
    /* 🔴 修改：两行截断 */
    display: -webkit-box;
    -webkit-line-clamp: 2;
     line-clamp: 2;  /* 新增：标准属性，提高兼容性 */
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .session-time {
    /* 🔴 修改：更小的字体大小 (10px) */
    font-size: 0.625rem;
    /* 🔴 修改：右对齐 */
    align-self: flex-end;
  }
  
  .messages-container {
    /* 🔴 修改：减小内边距 */
    padding: var(--space-12);
    /* 🔴 修改：调整底部内边距 */
    padding-bottom: calc(var(--space-32) + var(--space-16));
  }
  
  .chat-input-wrapper {
    /* 🔴 修改：减小内边距 */
    padding: var(--space-12);
  }
  
  .chat-input {
    /* 🔴 修改：减小内边距 */
    padding: var(--space-12) var(--space-16);
    /* 🔴 修改：减小圆角 */
    border-radius: var(--radius-lg);
  }
}

/* 🔵 新增：小屏幕手机适配 (480px及以下) */
@media (max-width: 480px) {
  :root {
    /* 🔴 修改：调整间距变量 */
    --space-16: 0.875rem;  /* 14px */
    --space-20: 1.25rem;   /* 20px */
  }
  
  h2 {
    font-size: var(--text-base);
  }
  
  .session-item {
    /* 🔴 修改：更窄的宽度 */
    width: 10rem;
  }
  
  .chat-input {
    /* 🔴 修改：更小的圆角 */
    border-radius: var(--radius-md);
  }
}

/* 🔵 新增：超大屏幕适配 (1600px及以上) */
@media (min-width: 1600px) {
  .chat-input {
    /* 🔴 修改：增大最大宽度 */
    max-width: 50rem;  /* 800px */
  }
}
</style>