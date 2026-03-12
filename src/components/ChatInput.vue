<!-- 
  组件名称：ChatInput
  作用：消息输入框，支持Enter发送
  接收参数：loading（是否正在等待回复）
  触发事件：send（当用户发送消息时触发）
-->
<template>
  <div class="chat-input">
    <!--textarea的值和message变量用v-model双向绑定 -->
    <!-- 用户输入时，message自动更新；修改message时，textarea内容自动更新 -->
    <!-- :disabled="loading" 当loading为true时禁用输入框 -->
    <textarea
      v-model="message"
      placeholder="请输入消息..."
      :disabled="loading"
      @keyup.enter.prevent="sendMessage"
      rows="1"
      ref="textareaRef"
    ></textarea>
    <button
      @click="sendMessage"
      :disabled="loading||!message.trim()"
      class="send-btn"
    >{{ loading ? '发送中...' : '发送'}}</button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

//defineProps - 接收父组件数据
//声明这个组件需要接收一个loading参数
const props = defineProps({
  loading:Boolean
})

//defineEmits - 向父组件发送事件
//声明这个组件可以触发'send'事件
const emit = defineEmits(['send'])

//ref - 定义响应式数据
//定义message变量，初始值为空字符串
//ref包装后的数据，修改时需要 .value，但在模板中不需要
const message=ref('')
const textareaRef = ref(null)

// 🔵 新增：自适应高度功能
const adjustTextareaHeight = () => {
  if (!textareaRef.value) return
  
  // 重置高度
  textareaRef.value.style.height = 'auto'
  // 计算内容高度，限制最大高度
  const newHeight = Math.min(textareaRef.value.scrollHeight, 120) // 最大120px
  textareaRef.value.style.height = newHeight + 'px'
}

// 🔵 新增：监听message变化调整高度
watch(message, () => {
  nextTick(() => {
    adjustTextareaHeight()
  })
})

//sendMessage - 发送消息
const sendMessage = () => {
  //表单验证
  //trim()去掉字符串首尾的空格
  //如果内容不为空 并且 不在加载状态
  if (message.value.trim() && !props.loading) {
    //ChatInput 子组件 (发送方)-emit('send', "消息内容")
    // 触发父组件监听的 @send 事件-父组件的 handleSend 方法处理消息（如发送网络请求）
    emit('send', message.value.trim()) //触发send事件，并传递message的值
    // 【代码作用】清空输入框
    message.value = ''
    // 🔵 新增：重置输入框高度
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  }
}
</script>

<style scoped>
/* 🔵 新增：使用CSS变量继承父组件的设计系统 */
.chat-input {
  display: flex;
  /* 🔴 修改：10px -> 0.625rem 使用相对单位 */
  gap: 0.625rem;
  /* 🔴 修改：移除padding，由父组件控制 */
  width: 100%;
  align-items: flex-end;
  /* 🔵 新增：确保容器正确收缩 */
  flex-shrink: 0;
}

/* 🔴 修改：优化文本域样式 */
textarea {
  flex: 1;
  /* 🔴 修改：12px -> 0.75rem 使用相对单位 */
  padding: 0.75rem 1rem;
  /* 🔴 修改：1px -> 0.0625rem 使用相对单位 */
  border: 0.0625rem solid #ddd;
  /* 🔴 修改：8px -> 0.5rem 使用相对单位 */
  border-radius: 0.5rem;
  resize: none;
  font-family: inherit;
  /* 🔴 修改：14px -> 0.875rem 使用相对单位 */
  font-size: 0.875rem;
  line-height: 1.5;
  /* 🔵 新增：最小高度，触摸友好 */
  min-height: 2.75rem;
  /* 🔵 新增：最大高度限制 */
  max-height: 7.5rem;
  /* 🔵 新增：垂直滚动 */
  overflow-y: auto;
  /* 🔵 新增：平滑过渡 */
  transition: all 0.2s ease;
  /* 🔵 新增：确保宽度计算正确 */
  box-sizing: border-box;
}

/* 🔵 新增：文本域聚焦状态 */
textarea:focus {
  outline: none;
  /* 🔴 修改：使用继承的颜色变量 */
  border-color: #2196f3;
  /* 🔵 新增：聚焦阴影效果 */
  box-shadow: 0 0 0 0.125rem rgba(33, 150, 243, 0.1);
}

/* 🔵 新增：禁用状态样式 */
textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 🔴 修改：优化按钮样式 */
.send-btn {
  /* 🔴 修改：0 20px -> 0 1.25rem 使用相对单位 */
  padding: 0 1.25rem;
  background: #2196f3;
  color: white;
  border: none;
  /* 🔴 修改：8px -> 0.5rem 使用相对单位 */
  border-radius: 0.5rem;
  cursor: pointer;
  /* 🔴 修改：16px -> 1rem 使用相对单位 */
  font-size: 1rem;
  /* 🔵 新增：触摸友好高度 */
  height: 2.75rem;
  /* 🔵 新增：防止按钮被压缩 */
  flex-shrink: 0;
  /* 🔵 新增：过渡动画 */
  transition: all 0.2s ease;
  /* 🔵 新增：字重优化 */
  font-weight: 500;
}

/* 🔵 新增：按钮悬停状态 */
.send-btn:not(:disabled):hover {
  background: #1976d2;
  /* 🔵 新增：微交互反馈 */
  transform: translateY(-0.0625rem);
  /* 🔵 新增：悬停阴影 */
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
}

/* 🔵 新增：按钮激活状态 */
.send-btn:not(:disabled):active {
  transform: translateY(0);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  /* 🔵 新增：禁用状态透明度 */
  opacity: 0.6;
  /* 🔵 新增：移除悬停效果 */
  transform: none;
  box-shadow: none;
}

/* ========== 🔵 新增：响应式设计 ========== */
/* 平板端适配 */
@media (max-width: 1024px) {
  .chat-input {
    gap: 0.5rem;
  }
  
  textarea {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
    min-height: 2.5rem;
  }
  
  .send-btn {
    padding: 0 1rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .chat-input {
    gap: 0.5rem;
  }
  
  textarea {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    min-height: 2.25rem;
    max-height: 6rem;
  }
  
  .send-btn {
    padding: 0 0.875rem;
    height: 2.25rem;
    font-size: 0.75rem;
    /* 🔵 新增：移动端圆角调整 */
    border-radius: 0.375rem;
  }
}

/* 小屏幕手机适配 */
@media (max-width: 480px) {
  .chat-input {
    gap: 0.375rem;
  }
  
  textarea {
    padding: 0.375rem 0.625rem;
    font-size: 0.6875rem;
    min-height: 2rem;
    border-radius: 0.375rem;
  }
  
  .send-btn {
    padding: 0 0.75rem;
    height: 2rem;
    font-size: 0.6875rem;
    border-radius: 0.25rem;
  }
}
</style>