<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { WeekIdentifier } from '@/data/utils/scheduleUtils'
import {
  formatWeekIdentifier,
  getPreviousWeekIdentifier,
  getNextWeekIdentifier,
  getWeekStartDate
} from '@/data/utils/scheduleUtils'
import { getAvailableWeeks } from '@/data/schedule'

const props = defineProps<{
  currentWeek: WeekIdentifier
  availableWeeks: WeekIdentifier[]
}>()

const emit = defineEmits<{
  'update:currentWeek': [weekId: WeekIdentifier]
}>()

const isDropdownOpen = ref(false)

// 格式化当前周
const currentWeekLabel = computed(() => formatWeekIdentifier(props.currentWeek))

// 格式化周范围
const currentWeekRange = computed(() => {
  const monday = getWeekStartDate(props.currentWeek)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const start = monday.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  const end = sunday.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${start} - ${end}`
})

// 检查是否可以前进/后退
const canGoPrevious = computed(() => {
  const prevWeek = getPreviousWeekIdentifier(props.currentWeek)
  return props.availableWeeks.includes(prevWeek)
})

const canGoNext = computed(() => {
  const nextWeek = getNextWeekIdentifier(props.currentWeek)
  return props.availableWeeks.includes(nextWeek)
})

// 切换到上一周
const goToPreviousWeek = () => {
  if (canGoPrevious.value) {
    const prevWeek = getPreviousWeekIdentifier(props.currentWeek)
    emit('update:currentWeek', prevWeek)
  }
}

// 切换到下一周
const goToNextWeek = () => {
  if (canGoNext.value) {
    const nextWeek = getNextWeekIdentifier(props.currentWeek)
    emit('update:currentWeek', nextWeek)
  }
}

// 选择特定周
const selectWeek = (weekId: WeekIdentifier) => {
  emit('update:currentWeek', weekId)
  isDropdownOpen.value = false
}

// 切换下拉菜单
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.week-selector')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="week-selector">
    <button
      class="week-selector__nav"
      :class="{ 'week-selector__nav--disabled': !canGoPrevious }"
      :disabled="!canGoPrevious"
      @click="goToPreviousWeek"
      title="上一周"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div class="week-selector__current" @click="toggleDropdown">
      <div class="week-selector__label">
        <span class="week-selector__week">{{ currentWeekLabel }}</span>
        <span class="week-selector__range">{{ currentWeekRange }}</span>
      </div>
      <svg
        class="week-selector__dropdown-icon"
        :class="{ 'week-selector__dropdown-icon--open': isDropdownOpen }"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <!-- 下拉菜单 -->
      <div v-if="isDropdownOpen" class="week-selector__dropdown">
        <div class="week-selector__dropdown-header">选择周</div>
        <div class="week-selector__dropdown-list">
          <button
            v-for="weekId in availableWeeks"
            :key="weekId"
            class="week-selector__dropdown-item"
            :class="{ 'week-selector__dropdown-item--active': weekId === currentWeek }"
            @click.stop="selectWeek(weekId)"
          >
            <span class="week-selector__dropdown-item-label">{{ formatWeekIdentifier(weekId) }}</span>
            <span v-if="weekId === currentWeek" class="week-selector__dropdown-item-check">✓</span>
          </button>
        </div>
      </div>
    </div>

    <button
      class="week-selector__nav"
      :class="{ 'week-selector__nav--disabled': !canGoNext }"
      :disabled="!canGoNext"
      @click="goToNextWeek"
      title="下一周"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.week-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  max-width: 420px;
}

.week-selector__nav {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.week-selector__nav:hover:not(:disabled) {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border-color: #a5b4fc;
  color: #4f46e5;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.15);
}

.week-selector__nav:active:not(:disabled) {
  transform: scale(0.95);
}

.week-selector__nav--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.week-selector__current {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex: 1 1 auto;
  min-width: 0;
}

.week-selector__current:hover {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border-color: #a5b4fc;
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.15);
}

.week-selector__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.week-selector__week {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.week-selector__range {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.week-selector__dropdown-icon {
  color: #94a3b8;
  transition: transform 200ms ease;
  flex-shrink: 0;
}

.week-selector__dropdown-icon--open {
  transform: rotate(180deg);
}

.week-selector__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
  overflow: hidden;
  animation: dropdown-appear 200ms ease-out;
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.week-selector__dropdown-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.week-selector__dropdown-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
}

.week-selector__dropdown-list::-webkit-scrollbar {
  width: 6px;
}

.week-selector__dropdown-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.week-selector__dropdown-list::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.week-selector__dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  text-align: left;
}

.week-selector__dropdown-item:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  color: #0f172a;
}

.week-selector__dropdown-item--active {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  color: #4f46e5;
  font-weight: 700;
}

.week-selector__dropdown-item--active:hover {
  background: linear-gradient(135deg, #e0e7ff, #ddd6fe);
}

.week-selector__dropdown-item-label {
  flex: 1;
}

.week-selector__dropdown-item-check {
  font-size: 16px;
  color: #10b981;
  font-weight: 700;
}

@media (max-width: 720px) {
  .week-selector {
    gap: 8px;
  }

  .week-selector__nav {
    width: 36px;
    height: 36px;
  }

  .week-selector__current {
    min-width: 200px;
    padding: 8px 12px;
  }

  .week-selector__week {
    font-size: 13px;
  }

  .week-selector__range {
    font-size: 11px;
  }
}
</style>
