<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { DayCard, TagType, TagMeta } from '@/types/schedule'
import DayCardComponent from './DayCard.vue'

defineProps<{
  dayCards: DayCard[]
  tagMeta: Record<TagType, TagMeta>
}>()

const gridRef = ref<HTMLElement | null>(null)
const scrollPosition = ref(0)
const showScrollControls = ref(false)
const cardHeight = ref<number>(0)

// 计算卡片可用高度
const calculateCardHeight = () => {
  if (!gridRef.value) return

  const gridHeight = gridRef.value.clientHeight
  const computedStyle = window.getComputedStyle(gridRef.value)
  const gridPaddingTop = parseFloat(computedStyle.paddingTop)
  const gridPaddingBottom = parseFloat(computedStyle.paddingBottom)
  const bottomMargin = 20 // 为汉堡按钮和圆角留出的额外空间

  const calculatedHeight = gridHeight - gridPaddingTop - gridPaddingBottom - bottomMargin

  // 确保高度为正数
  cardHeight.value = Math.max(calculatedHeight, 200)

  console.log('Grid height calculation:', {
    gridHeight,
    gridPaddingTop,
    gridPaddingBottom,
    bottomMargin,
    calculatedHeight: cardHeight.value
  })
}

// 检测是否需要滚动控制
const checkScrollNeeded = () => {
  if (!gridRef.value) return
  // 当内容宽度大于容器宽度时显示滚动控制
  showScrollControls.value = gridRef.value.scrollWidth > gridRef.value.clientWidth
}

// 滚动到指定位置
const scrollTo = (direction: 'left' | 'right') => {
  if (!gridRef.value) return

  const container = gridRef.value
  const cardWidth = container.scrollWidth / 7 // 7天
  const visibleCards = 1 // 一次移动1天
  const scrollAmount = cardWidth * visibleCards

  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

// 更新滚动位置
const updateScrollPosition = () => {
  if (gridRef.value) {
    scrollPosition.value = gridRef.value.scrollLeft
  }
}

// 判断是否可以向左滚动
const canScrollLeft = computed(() => {
  return scrollPosition.value > 0
})

// 判断是否可以向右滚动
const canScrollRight = computed(() => {
  if (!gridRef.value) return false
  return scrollPosition.value < gridRef.value.scrollWidth - gridRef.value.clientWidth - 10
})

onMounted(() => {
  nextTick(() => {
    checkScrollNeeded()
    calculateCardHeight()
  })
  window.addEventListener('resize', () => {
    checkScrollNeeded()
    calculateCardHeight()
  })
  if (gridRef.value) {
    gridRef.value.addEventListener('scroll', updateScrollPosition)
    // 初始化时更新滚动位置，确保箭头正确显示
    updateScrollPosition()
    // 使用 ResizeObserver 监听网格大小变化
    const resizeObserver = new ResizeObserver(() => {
      checkScrollNeeded()
      updateScrollPosition()
      calculateCardHeight()
    })
    resizeObserver.observe(gridRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScrollNeeded)
  if (gridRef.value) {
    gridRef.value.removeEventListener('scroll', updateScrollPosition)
  }
})
</script>

<template>
  <div class="week-grid-container">
    <!-- 左箭头 -->
    <button
      v-if="showScrollControls && canScrollLeft"
      class="scroll-button scroll-button--left"
      @click="scrollTo('left')"
      aria-label="向左滚动"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- 日程网格 -->
    <section ref="gridRef" class="grid">
      <DayCardComponent
        v-for="day in dayCards"
        :key="day.longName"
        :day="day"
        :tag-meta="tagMeta"
        :card-height="cardHeight"
      />
    </section>

    <!-- 右箭头 -->
    <button
      v-if="showScrollControls && canScrollRight"
      class="scroll-button scroll-button--right"
      @click="scrollTo('right')"
      aria-label="向右滚动"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.week-grid-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: stretch;

  /* 增加overflow: visible确保阴影不被裁剪 */
  overflow: visible;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(320px, 1fr));
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  /* 增加padding防止hover时卡片阴影被裁剪，底部留出足够空间显示汉堡按钮和圆角 */
  padding: 30px 0 0px 0;
  align-items: stretch;
}

.grid > * {
  scroll-snap-align: start;
}

/* 隐藏滚动条 - Webkit浏览器 */
.grid::-webkit-scrollbar {
  display: none;
}

/* 移动端调整 padding */
@media (max-width: 768px) {
  .grid {
    padding: 20px 8px 40px 8px;
  }
}

/* 高度受限时调整 padding，但保持底部空间 */
@media (max-height: 800px) {
  .grid {
    padding: 20px 0 40px 0;
  }
}

@media (max-height: 600px) {
  .grid {
    padding: 10px 0 30px 0;
  }
}

/* 响应式布局 - 调整card最小宽度确保完整显示 */
/* 2500px及以上：card可以更宽 */
@media (min-width: 2500px) {
  .grid {
    grid-template-columns: repeat(7, 1fr);
  }
}

/* 430px以下：减少最小宽度和间距 */
@media (max-width: 430px) {
  .grid {
    grid-template-columns: repeat(7, minmax(280px, 1fr));
    gap: 8px;
    padding: 4px 4px;
  }
}

/* 滚动按钮 */
.scroll-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.08);
}

.scroll-button:hover {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-color: #6366f1;
  transform: translateY(-50%) scale(1.1);
  box-shadow:
    0 6px 16px rgba(99, 102, 241, 0.3),
    0 4px 8px rgba(99, 102, 241, 0.2);
}

.scroll-button:active {
  transform: translateY(-50%) scale(1.05);
}

/* 在需要滚动时调整按钮位置 */
.scroll-button--left {
  left: 8px;
}

.scroll-button--right {
  right: 8px;
}

/* 按钮图标动画 */
.scroll-button svg {
  transition: transform 200ms ease;
}

.scroll-button:hover svg {
  transform: scale(1.2);
}

.scroll-button--left:hover svg {
  animation: bounce-left 600ms ease-in-out infinite;
}

.scroll-button--right:hover svg {
  animation: bounce-right 600ms ease-in-out infinite;
}

@keyframes bounce-left {
  0%, 100% {
    transform: translateX(0) scale(1.2);
  }
  50% {
    transform: translateX(-4px) scale(1.2);
  }
}

@keyframes bounce-right {
  0%, 100% {
    transform: translateX(0) scale(1.2);
  }
  50% {
    transform: translateX(4px) scale(1.2);
  }
}
</style>
