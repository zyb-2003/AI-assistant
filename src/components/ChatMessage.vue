<!-- 
  组件名称：ChatMessage
  作用：显示单条消息，包括头像、内容、时间、复制按钮
  接收参数：message对象（包含id, role, content, time）
-->
<template>
  <div class="message" :class="message.role">
    <!--显示头像-->
    <div class="avatar">
      {{ message.role === 'user' ? '👤' : '🤖' }}
    </div>
    <div class="content-wrapper">
      <!--显示内容-->
      <div class="content">
        {{ message.content }} 
        <span v-if="message.isStreaming" class="cursor">|</span>
      </div>
      <div class="meta">
        <!--显示时间-->
        <span class="time">{{ message.time }}</span>
        <!--复制按钮（条件渲染）-->
        <button 
          v-if="message.role === 'assistant'"
          @click="copyContent"
          class="copy-btn"
          :title="copySuccess ? '复制成功' : '复制内容'"
          :class="{ 'copied': copySuccess }"
        >
          {{ copySuccess ? '✓' : '复制' }}
        </button>
      </div>
    </div>
  </div>
</template>

<!--Vue 3 中的一个编译时语法糖，用于简化 Composition API 的使用-->
<!--定义的变量、函数会自动暴露给模板使用，不需要return-->
<!--组件导入后可直接使用-->
<script setup>
import { ref } from 'vue'

//defineProps - 定义组件接收的参数
//声明这个组件需要接收一个message对象作为参数
const props=defineProps({
  message: {
    type: Object,
    required: true //必须传入，否则报错
  }
})

// 🔵 新增：复制状态跟踪
const copySuccess = ref(false)
let copyTimeout = null

//copyContent - 复制内容到剪贴板
const copyContent=async()=>{
  try{
    //使用浏览器剪贴板API复制文本
    // navigator.clipboard是浏览器提供的剪贴板对象
    // writeText方法将文本写入剪贴板
    await navigator.clipboard.writeText(props.message.content);
    
    // 🔵 修改：优化复制成功反馈
    copySuccess.value = true
    
    // 🔵 新增：3秒后重置复制状态
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => {
      copySuccess.value = false
    }, 3000)
    
    /* ========== 【模拟数据】当前项目用alert提示 ========== */
    // alert('复制成功');  // 🔴 修改：移除alert，改用视觉反馈
  }
  catch(err){
    // 如果复制失败，提示用户
    alert('复制失败');
    // 🔵 新增：重置复制状态
    copySuccess.value = false
  }
}
</script>

<style scoped>
/* 【了解查文档】scoped表示样式只对当前组件生效，不影响其他组件 */

/* 🔴 修改：使用相对单位优化间距 */
.message {
  display: flex; /* flex布局 */
  /* 🔴 修改：20px -> 1.25rem 使用相对单位 */
  margin: 1.25rem 0;
  /* 🔴 修改：12px -> 0.75rem 使用相对单位 */
  gap: 0.75rem; /* gap表示子元素之间的间距 */
  /* 🔵 新增：消息进入动画 */
  animation: fadeIn 0.3s ease;
  /* 🔵 新增：确保消息不会溢出 */
  max-width: 100%;
  box-sizing: border-box;
}

/* 🔵 新增：AI消息右对齐 */
.message.assistant {
  flex-direction: row;
}

/* 🔵 新增：用户消息左对齐 */
.message.user {
  flex-direction: row-reverse;
}

/* 🔴 修改：优化头像样式 */
.avatar {
  /* 🔴 修改：36px -> 2.25rem 使用相对单位 */
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 🔴 修改：20px -> 1.25rem 使用相对单位 */
  font-size: 1.25rem;
  /* 🔵 新增：触摸友好 */
  flex-shrink: 0;
  /* 🔵 新增：头像过渡动画 */
  transition: all 0.2s ease;
}

/* 🔵 新增：用户头像特殊样式 */
.message.user .avatar {
  background: #e3f2fd;
  /* 🔵 新增：用户头像悬停效果 */
  transform: scale(1);
}

.message.user .avatar:hover {
  transform: scale(1.05);
}

/* 🔵 新增：AI头像特殊样式 */
.message.assistant .avatar {
  background: #f5f5f5;
  /* 🔵 新增：AI头像悬停效果 */
  transform: scale(1);
}

.message.assistant .avatar:hover {
  transform: scale(1.05);
}

/* 🔴 修改：优化内容容器 */
.content-wrapper {
  /* 🔴 修改：70% -> 85% 移动端更友好，用媒体查询控制 */
  max-width: 85%;
  /* 🔵 新增：确保容器正确收缩 */
  flex: 1;
  min-width: 0;
}

/* 🔴 修改：优化消息内容样式 */
.content {
  /* 🔴 修改：12px 16px -> 0.75rem 1rem 使用相对单位 */
  padding: 0.75rem 1rem;
  /* 🔴 修改：12px -> 0.75rem 使用相对单位 */
  border-radius: 0.75rem;
  background: #f5f5f5;
  line-height: 1.5;
  /* 🔴 修改：14px -> 0.875rem 使用相对单位 */
  font-size: 0.875rem;
  /* 🔵 新增：自动换行 */
  word-wrap: break-word;
  overflow-wrap: break-word;
  /* 🔵 新增：最大宽度限制 */
  max-width: 100%;
  /* 🔵 新增：过渡动画 */
  transition: all 0.2s ease;
  /* 🔵 新增：白色空间处理 */
  white-space: pre-wrap;
}

.cursor {
  animation: blink 1s infinite;
  margin-left: 0.125rem;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 🔵 新增：用户消息内容样式 */
.message.user .content {
  background: #e3f2fd;
  /* 🔵 新增：用户消息圆角调整 */
  border-top-right-radius: 0.25rem;
  border-top-left-radius: 0.75rem;
}

/* 🔵 新增：AI消息内容样式 */
.message.assistant .content {
  background: #f5f5f5;
  /* 🔵 新增：AI消息圆角调整 */
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.75rem;
}

/* 🔴 修改：优化元信息样式 */
.meta {
  display: flex;
  justify-content: space-between;
  /* 🔴 修改：4px -> 0.25rem 使用相对单位 */
  margin-top: 0.25rem;
  /* 🔴 修改：12px -> 0.75rem 使用相对单位 */
  font-size: 0.75rem;
  color: #999;
  /* 🔵 新增：确保元信息不会换行 */
  white-space: nowrap;
  /* 🔵 新增：响应式对齐 */
  align-items: center;
}

/* 🔵 新增：用户消息元信息对齐 */
.message.user .meta {
  justify-content: flex-end;
}

/* 🔵 新增：AI消息元信息对齐 */
.message.assistant .meta {
  justify-content: flex-start;
}

/* 🔴 修改：优化时间样式 */
.time {
  color: #999;
  /* 🔵 新增：时间透明度 */
  opacity: 0.7;
  /* 🔵 新增：时间过渡 */
  transition: opacity 0.2s ease;
}

/* 🔵 新增：消息悬停时显示时间 */
.message:hover .time {
  opacity: 1;
}

/* 🔴 修改：优化复制按钮样式 */
.copy-btn {
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  /* 🔴 修改：12px -> 0.75rem 使用相对单位 */
  font-size: 0.75rem;
  /* 🔵 新增：内边距优化 */
  padding: 0.125rem 0.375rem;
  /* 🔵 新增：圆角 */
  border-radius: 0.25rem;
  /* 🔵 新增：过渡动画 */
  transition: all 0.2s ease;
  /* 🔵 新增：触摸友好 */
  min-height: 1.5rem;
  min-width: 2.5rem;
  /* 🔵 新增：显示状态 */
  opacity: 0;
}

/* 🔵 新增：消息悬停时显示复制按钮 */
.message:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  color: #333;
  /* 🔵 新增：悬停背景色 */
  background-color: #f0f0f0;
}

/* 🔵 新增：复制成功状态 */
.copy-btn.copied {
  color: #4caf50;
  background-color: #e8f5e9;
  opacity: 1;
}

.copy-btn.copied:hover {
  background-color: #c8e6c9;
}

/* 🔵 新增：消息进入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== 🔵 新增：响应式设计 ========== */
/* 平板端适配 */
@media (max-width: 1024px) {
  .message {
    margin: 1rem 0;
    gap: 0.625rem;
  }
  
  .avatar {
    width: 2rem;
    height: 2rem;
    font-size: 1.125rem;
  }
  
  .content-wrapper {
    max-width: 80%;
  }
  
  .content {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
    border-radius: 0.625rem;
  }
  
  .message.user .content {
    border-top-right-radius: 0.25rem;
    border-top-left-radius: 0.625rem;
  }
  
  .message.assistant .content {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.625rem;
  }
  
  .meta {
    font-size: 0.6875rem;
  }
  
  .copy-btn {
    font-size: 0.6875rem;
    min-height: 1.375rem;
    min-width: 2.25rem;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .message {
    margin: 0.75rem 0;
    gap: 0.5rem;
  }
  
  .avatar {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 1rem;
  }
  
  .content-wrapper {
    max-width: 75%;
  }
  
  .content {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 0.5rem;
    line-height: 1.4;
  }
  
  .message.user .content {
    border-top-right-radius: 0.125rem;
    border-top-left-radius: 0.5rem;
  }
  
  .message.assistant .content {
    border-top-left-radius: 0.125rem;
    border-top-right-radius: 0.5rem;
  }
  
  .meta {
    font-size: 0.625rem;
    margin-top: 0.125rem;
  }
  
  .time {
    opacity: 0.8; /* 移动端更明显 */
  }
  
  .copy-btn {
    font-size: 0.625rem;
    min-height: 1.25rem;
    min-width: 2rem;
    padding: 0.125rem 0.25rem;
    /* 🔵 新增：移动端始终显示复制按钮 */
    opacity: 0.7;
  }
  
  .copy-btn:hover {
    opacity: 1;
  }
}

/* 小屏幕手机适配 */
@media (max-width: 480px) {
  .message {
    margin: 0.5rem 0;
    gap: 0.375rem;
  }
  
  .avatar {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.875rem;
  }
  
  .content-wrapper {
    max-width: 70%;
  }
  
  .content {
    padding: 0.375rem 0.625rem;
    font-size: 0.6875rem;
    border-radius: 0.375rem;
    line-height: 1.3;
  }
  
  .message.user .content {
    border-top-right-radius: 0.125rem;
    border-top-left-radius: 0.375rem;
  }
  
  .message.assistant .content {
    border-top-left-radius: 0.125rem;
    border-top-right-radius: 0.375rem;
  }
  
  .meta {
    font-size: 0.5625rem;
  }
  
  .copy-btn {
    font-size: 0.5625rem;
    min-height: 1.125rem;
    min-width: 1.75rem;
    padding: 0.125rem 0.25rem;
    opacity: 0.8;
  }
}

/* 超大屏幕适配 */
@media (min-width: 1600px) {
  .content-wrapper {
    max-width: 65%;
  }
  
  .content {
    font-size: 1rem;
    padding: 1rem 1.25rem;
  }
}
</style>