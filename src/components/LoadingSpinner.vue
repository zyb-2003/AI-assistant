<!-- 
  组件名称：LoadingSpinner
  作用：显示加载中的动画，用于等待AI回复时
  使用场景：当loading为true时显示
  响应式优化：适配不同屏幕尺寸
-->

<template>
  <div class="loading-spinner">
    <!-- 【核心理解】CSS动画实现旋转效果 -->
    <div class="spinner"></div>
    <span class="loading-text">AI正在思考中，可能需要几分钟，请耐心等待...</span>
  </div>
</template>

/*
// 【对接后端】使用UI组件库的加载动画
// import { ElLoading } from 'element-plus'

// 开启加载
const loadingInstance = ElLoading.service({
  fullscreen: true,
  text: '加载中...'
})

// 关闭加载
loadingInstance.close() 
*/

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;  /* 🔵 新增：确保居中 */
  gap: 0.625rem;  /* 🔴 修改：10px → 0.625rem */
  padding: 1.25rem;  /* 🔴 修改：20px → 1.25rem */
  color: #999;
  width: 100%;
  box-sizing: border-box;
  min-height: 3.5rem;  /* 🔵 新增：触摸友好的最小高度 */
}

/* 【核心理解】CSS动画关键帧 */
.spinner {
  width: 1.25rem;  /* 🔴 修改：20px → 1.25rem */
  height: 1.25rem;  /* 🔴 修改：20px → 1.25rem */
  border: 0.125rem solid #f3f3f3;  /* 🔴 修改：2px → 0.125rem */
  border-top: 0.125rem solid #2196f3;  /* 🔴 修改：2px → 0.125rem */
  border-radius: 50%;
  animation: spin 1s linear infinite;  /* 【代码作用】无限循环动画 */
  flex-shrink: 0;  /* 🔵 新增：防止旋转器被压缩 */
}

.loading-text {
  font-size: 0.875rem;  /* 🔵 新增：14px -> 0.875rem */
  line-height: 1.4;
  transition: font-size 0.2s ease;  /* 🔵 新增：字体大小过渡 */
}

/* 【面试必考+手写】定义动画关键帧 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ========== 响应式设计 ========== */

/* 平板端适配 (1024px及以下) */
@media (max-width: 1024px) {
  .loading-spinner {
    gap: 0.5rem;  /* 8px */
    padding: 1rem;  /* 16px */
  }
  
  .spinner {
    width: 1.125rem;  /* 18px */
    height: 1.125rem;  /* 18px */
  }
  
  .loading-text {
    font-size: 0.8125rem;  /* 13px */
  }
}

/* 移动端适配 (768px及以下) */
@media (max-width: 768px) {
  .loading-spinner {
    gap: 0.375rem;  /* 6px */
    padding: 0.75rem;  /* 12px */
    min-height: 3rem;  /* 触摸友好调整 */
  }
  
  .spinner {
    width: 1rem;  /* 16px */
    height: 1rem;  /* 16px */
    border-width: 0.09375rem;  /* 1.5px，确保在小屏幕上清晰可见 */
  }
  
  .loading-text {
    font-size: 0.75rem;  /* 12px */
  }
}

/* 小屏幕手机适配 (480px及以下) */
@media (max-width: 480px) {
  .loading-spinner {
    flex-direction: column;  /* 🔵 新增：小屏幕改为垂直布局 */
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .spinner {
    width: 0.875rem;  /* 14px */
    height: 0.875rem;  /* 14px */
  }
  
  .loading-text {
    font-size: 0.6875rem;  /* 11px */
    text-align: center;  /* 🔵 新增：文字居中 */
  }
}

/* 超大屏幕适配 (1600px及以上) */
@media (min-width: 1600px) {
  .spinner {
    width: 1.5rem;  /* 24px */
    height: 1.5rem;  /* 24px */
    border-width: 0.1875rem;  /* 3px */
  }
  
  .loading-text {
    font-size: 1rem;  /* 16px */
  }
}

/* 高对比度模式适配 (可访问性优化) */
@media (prefers-contrast: high) {
  .spinner {
    border-top-color: #0d47a1;  /* 更深的蓝色，提高对比度 */
  }
  
  .loading-text {
    color: #666;  /* 更深的灰色，提高对比度 */
  }
}

/* 减少动画模式 (可访问性优化) */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;  /* 为对动画敏感的用户移除动画 */
    border: 0.125rem dashed #2196f3;  /* 改用虚线边框表示加载状态 */
  }
}
</style>