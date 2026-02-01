<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { WeekIdentifier } from '@/data/utils/scheduleUtils'
import {
  formatWeekIdentifier,
  getWeekStartDate
} from '@/data/utils/scheduleUtils'

const props = defineProps<{
  currentWeek: WeekIdentifier
  availableWeeks: WeekIdentifier[]
}>()

const emit = defineEmits<{
  'update:currentWeek': [weekId: WeekIdentifier]
}>()

const isDropdownOpen = ref(false)
const currentRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

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

const sortedWeeks = computed<WeekIdentifier[]>(() => {
  const merged = new Set<WeekIdentifier>([props.currentWeek, ...props.availableWeeks])
  return [...merged].sort()
})

const currentIndex = computed(() => {
  return sortedWeeks.value.indexOf(props.currentWeek)
})

const previousAvailableWeek = computed(() => {
  const index = currentIndex.value
  return index > 0 ? sortedWeeks.value[index - 1] : undefined
})

const nextAvailableWeek = computed(() => {
  const index = currentIndex.value
  return index >= 0 && index < sortedWeeks.value.length - 1
    ? sortedWeeks.value[index + 1]
    : undefined
})

const canGoPrevious = computed(() => Boolean(previousAvailableWeek.value))
const canGoNext = computed(() => Boolean(nextAvailableWeek.value))

// 切换到上一周
const goToPreviousWeek = () => {
  const prevWeek = previousAvailableWeek.value
  if (prevWeek) emit('update:currentWeek', prevWeek)
}

// 切换到下一周
const goToNextWeek = () => {
  const nextWeek = nextAvailableWeek.value
  if (nextWeek) emit('update:currentWeek', nextWeek)
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

const updateDropdownPosition = () => {
  if (!currentRef.value) return
  const rect = currentRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (currentRef.value?.contains(target) || dropdownRef.value?.contains(target)) return
  if (target.closest('.week-selector')) return
  isDropdownOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateDropdownPosition)
  window.addEventListener('scroll', updateDropdownPosition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
})

watch(isDropdownOpen, (open) => {
  if (open) {
    nextTick(updateDropdownPosition)
  }
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

    <div ref="currentRef" class="week-selector__current" @click="toggleDropdown">
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

    </div>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <div
        v-if="isDropdownOpen"
        ref="dropdownRef"
        class="week-selector__dropdown week-selector__dropdown--portal"
        :style="dropdownStyle"
      >
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
    </Teleport>

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
  position: relative;
  z-index: 6;
}

.week-selector__nav {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--outline);
  background: linear-gradient(135deg, #fffdf4, #fff2b3);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 2px 2px 0 var(--shadow);
}

.week-selector__nav:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--sun), #fff3c7);
  color: var(--ink);
  transform: translate(-2px, -2px) rotate(-2deg);
  box-shadow: 4px 4px 0 var(--shadow-strong);
}

.week-selector__nav:active:not(:disabled) {
  transform: translate(0, 0) scale(0.98);
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
  border-radius: var(--radius-md);
  border: 2px solid var(--outline);
  background: linear-gradient(135deg, #ffffff, #fff7d6);
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 3px 3px 0 var(--shadow);
  flex: 1 1 auto;
  min-width: 0;
}

.week-selector__current:hover {
  background: linear-gradient(135deg, #fff, #ffe3f2);
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--shadow-strong);
}

.week-selector__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.week-selector__week {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: 0.02em;
  font-family: var(--font-display);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.week-selector__range {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.week-selector__dropdown-icon {
  color: var(--ink-soft);
  transition: transform 200ms ease;
  flex-shrink: 0;
}

.week-selector__dropdown-icon--open {
  transform: rotate(180deg);
}

.week-selector__dropdown {
  position: fixed;
  background: #ffffff;
  border: 2px solid var(--outline);
  border-radius: var(--radius-md);
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 12px 28px rgba(31, 27, 22, 0.2);
  z-index: 999;
  overflow: hidden;
  animation: dropdown-appear 220ms ease-out;
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.week-selector__dropdown-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff5c2, #ffe3f2);
  border-bottom: 2px dashed rgba(90, 77, 67, 0.35);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink);
  font-family: var(--font-display);
}

.week-selector__dropdown-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(90, 77, 67, 0.6) rgba(255, 255, 255, 0.6);
}

.week-selector__dropdown-list::-webkit-scrollbar {
  width: 8px;
}

.week-selector__dropdown-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ffe3f2, #fff2b3);
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: inset 0 0 0 1px rgba(90, 77, 67, 0.35);
}

.week-selector__dropdown-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.65);
  border-radius: 999px;
  border: 1px dashed rgba(90, 77, 67, 0.2);
}

.week-selector__dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 2px solid transparent;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 150ms ease;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  text-align: left;
}

.week-selector__dropdown-item:hover {
  background: linear-gradient(135deg, #fff7d6, #ffffff);
  border-color: var(--outline);
  transform: translateX(2px);
}

.week-selector__dropdown-item--active {
  background: linear-gradient(135deg, #ffe3f2, #fff7d6);
  color: var(--ink);
  font-weight: 800;
  border-color: var(--outline);
}

.week-selector__dropdown-item--active:hover {
  background: linear-gradient(135deg, #ffd1ef, #fff2b3);
}

.week-selector__dropdown-item-label {
  flex: 1;
}

.week-selector__dropdown-item-check {
  font-size: 16px;
  color: var(--mint);
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
