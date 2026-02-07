<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  shallowRef,
  useTemplateRef,
} from 'vue'
import type { DayCard, TagType, TagMeta, MemberTag, TypeTag } from '@/types/ui'
import type { LiveRecordView } from '@/domain/records'
import DayCardComponent from './DayCard.vue'

defineProps<{
  dayCards: DayCard<LiveRecordView>[]
  tagMeta: Record<TagType, TagMeta>
  memberTags: MemberTag[]
  typeTags: TypeTag[]
}>()

const gridRef = useTemplateRef<HTMLElement>('grid')
const scrollPosition = shallowRef(0)
const showScrollControls = shallowRef(false)
const cardHeight = shallowRef(0)
let resizeObserver: ResizeObserver | null = null

// 计算卡片可用高度
const calculateCardHeight = () => {
  if (!gridRef.value) return

  const gridHeight = gridRef.value.clientHeight
  const computedStyle = window.getComputedStyle(gridRef.value)
  const gridPaddingTop = parseFloat(computedStyle.paddingTop)
  const gridPaddingBottom = parseFloat(computedStyle.paddingBottom)
  const bottomMargin = 12
  // 为阴影与汉堡按钮留出空间

  const calculatedHeight = gridHeight - gridPaddingTop - gridPaddingBottom - bottomMargin

  // 确保高度为正数
  cardHeight.value = Math.max(calculatedHeight, 200)
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

const handleResize = () => {
  checkScrollNeeded()
  calculateCardHeight()
}

const handleScroll = () => {
  updateScrollPosition()
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

const scrollToToday = () => {
  if (!gridRef.value) return

  // 这里的 class 需要匹配 DayCard 内部的样式或通过 ref 获取，
  // 由于 DayCard 是组件，可以直接查找子元素中有 day-card--today class 的元素
  // 但因为 DayCard 是封装组件，我们需要确保 DOM 已渲染。
  // 简单方式：遍历查找
  const todayCard = gridRef.value.querySelector('.day-card--today')
  if (todayCard) {
    // 手机端居中显示
    const container = gridRef.value
    // 让今天居中：cardLeft - containerWidth/2 + cardWidth/2
    const cardLeft = (todayCard as HTMLElement).offsetLeft
    const cardWidth = (todayCard as HTMLElement).offsetWidth
    const containerWidth = container.clientWidth

    // 仅在内容宽度超过容器时滚动
    if (container.scrollWidth > containerWidth) {
      const targetScroll = cardLeft - containerWidth / 2 + cardWidth / 2
      container.scrollTo({ left: targetScroll, behavior: 'smooth' })
    }
  }
}

onMounted(() => {
  nextTick(() => {
    checkScrollNeeded()
    calculateCardHeight()
    // 初始加载自动滚动到今天
    setTimeout(scrollToToday, 100)
  })
  window.addEventListener('resize', handleResize)
  if (!gridRef.value) return

  gridRef.value.addEventListener('scroll', handleScroll)
  // 初始化时更新滚动位置，确保箭头正确显示
  updateScrollPosition()
  // 使用 ResizeObserver 监听网格大小变化
  resizeObserver = new ResizeObserver(() => {
    checkScrollNeeded()
    updateScrollPosition()
    calculateCardHeight()
  })
  resizeObserver.observe(gridRef.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (gridRef.value) {
    gridRef.value.removeEventListener('scroll', handleScroll)
  }
  resizeObserver?.disconnect()
  resizeObserver = null
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
    <section ref="grid" class="grid">
      <DayCardComponent
        v-for="day in dayCards"
        :key="day.longName"
        :day="day"
        :tag-meta="tagMeta"
        :member-tags="memberTags"
        :type-tags="typeTags"
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
  z-index: 1;

  /* 增加overflow: visible确保阴影不被裁剪 */
  overflow: visible;
}

.week-grid-container::before {
  content: '';
  position: absolute;
  top: 12px;
  right: 8%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px dashed rgb(var(--ink-deep-rgb) / 0.25);
  background: rgb(var(--white-rgb) / 0.4);
  transform: rotate(12deg);
  pointer-events: none;
  z-index: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(320px, 1fr));
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  /* 增加padding防止hover时卡片阴影被裁剪，底部留出足够空间显示汉堡按钮和圆角 */
  padding: 32px 18px 12px;
  scroll-padding: 0 18px;
  align-items: stretch;
  position: relative;
  z-index: 1;
}

.grid > * {
  scroll-snap-align: start;
  animation: card-rise 800ms var(--ease-out-back) both;
}

.grid > *:nth-child(1) {
  animation-delay: 60ms;
}

.grid > *:nth-child(2) {
  animation-delay: 120ms;
}

.grid > *:nth-child(3) {
  animation-delay: 180ms;
}

.grid > *:nth-child(4) {
  animation-delay: 240ms;
}

.grid > *:nth-child(5) {
  animation-delay: 300ms;
}

.grid > *:nth-child(6) {
  animation-delay: 360ms;
}

.grid > *:nth-child(7) {
  animation-delay: 420ms;
}

@keyframes card-rise {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 隐藏滚动条 - Webkit浏览器 */
.grid::-webkit-scrollbar {
  display: none;
}

/* 移动端调整 padding */
@media (max-width: 768px) {
  .grid {
    padding: 22px 12px 26px;
    scroll-padding: 0 12px;
  }
}

/* 高度受限时调整 padding，但保持底部空间 */
@media (max-height: 800px) {
  .grid {
    padding: 18px 14px 24px;
    scroll-padding: 0 14px;
  }
}

@media (max-height: 600px) {
  .grid {
    padding: 12px 12px 18px;
    scroll-padding: 0 12px;
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
/* 430px以下：减少最小宽度和间距 */
@media (max-width: 430px) {
  .grid {
    grid-template-columns: repeat(7, minmax(100%, 1fr));
    /* 增加 gap 防止前一天的阴影在左侧露出 (box-shadow extends ~4-6px) */
    gap: 20px;
    padding: 12px 8px 16px;
    scroll-padding: 0 8px;
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
  border: 2px solid var(--outline);
  background: linear-gradient(135deg, var(--surface-warm) 0%, var(--surface-rose) 100%);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 400ms var(--ease-out-back);
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    0 12px 18px rgb(var(--ink-deep-rgb) / 0.18);
}

.scroll-button:hover {
  background: linear-gradient(
    135deg,
    var(--schedule-accent-warm) 0%,
    var(--schedule-accent-hot) 100%
  );
  color: var(--text-on-accent);
  border-color: var(--outline);
  transform: translate(-2px, -50%) scale(1.05) rotate(-2deg);
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 16px 24px rgb(var(--ink-deep-rgb) / 0.22);
}

.scroll-button:active {
  transform: translateY(-50%) scale(0.98);
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
    transform: translateX(-5px) scale(1.2);
  }
}

@keyframes bounce-right {
  0%, 100% {
    transform: translateX(0) scale(1.2);
  }
  50% {
    transform: translateX(5px) scale(1.2);
  }
}

/* ========== SHADCN/UI MINIMALIST DARK OVERRIDES ========== */
:root[data-theme='dark'] .week-grid-container::before {
  border-color: var(--outline);
  background: transparent;
  box-shadow: none;
  animation: none;
  opacity: 0.1;
  background-image: radial-gradient(var(--ink-soft) 1px, transparent 1px);
  background-size: 16px 16px;
}

:root[data-theme='dark'] .scroll-button {
  background: var(--surface-warm);
  border-color: var(--outline);
  color: var(--ink);
  box-shadow: var(--shadow);
}

:root[data-theme='dark'] .scroll-button:hover {
  background: var(--surface-warm-strong);
  border-color: var(--ink-soft);
  color: var(--ink);
  box-shadow: var(--shadow-strong);
  transform: translateY(-50%) scale(1.05);
}
</style>
