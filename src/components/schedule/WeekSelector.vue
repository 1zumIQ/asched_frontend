<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { IsoWeek } from '@/data/utils/isoWeek'
import { compareIsoWeeks, formatIsoWeekLabel, getIsoWeekKey, getIsoWeekRangeLabel, getIsoWeekStartDate } from '@/data/utils/isoWeek'
import type { ApiLiveRecord } from '@/data/schedule'
import { getRecordMemberTags, getRecordStartDate, isSameDay } from '@/data/records'
import type { TagType, TagMeta, MemberTag } from '@/types/ui'
import { getLiveRecordsByWeek } from '@/data/schedule'
import WeekDaySwatch from './WeekDaySwatch.vue'

const props = defineProps<{
  currentWeek: IsoWeek
  availableWeeks: IsoWeek[]
  tagMeta: Record<TagType, TagMeta>
  memberTags: MemberTag[]
}>()

const emit = defineEmits<{
  'update:currentWeek': [week: IsoWeek]
}>()

const isDropdownOpen = ref(false)
const currentRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})
const weekPreviews = ref<Record<string, WeekPreview>>({})
const isLoadingPreviews = ref(false)

type DayPreview = {
  colors: string[]
  hasLive: boolean
  tooltip: string
}

type WeekPreview = {
  range: string
  days: DayPreview[]
}

const currentWeekLabel = computed(() => formatIsoWeekLabel(props.currentWeek))

const currentWeekRange = computed(() => getIsoWeekRangeLabel(props.currentWeek, 'zh-CN'))

const currentKey = computed(() => getIsoWeekKey(props.currentWeek))

const sortedWeeks = computed<IsoWeek[]>(() => {
  const merged = new Map<string, IsoWeek>()
    ;[props.currentWeek, ...props.availableWeeks].forEach((week) => {
      merged.set(getIsoWeekKey(week), week)
    })
  return [...merged.values()].sort(compareIsoWeeks)
})

const currentIndex = computed(() => {
  return sortedWeeks.value.findIndex(week => getIsoWeekKey(week) === currentKey.value)
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
const selectWeek = (week: IsoWeek) => {
  emit('update:currentWeek', week)
  isDropdownOpen.value = false
}

// 切换下拉菜单
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const buildWeekPreview = (week: IsoWeek, records: ApiLiveRecord[]) => {
  const monday = getIsoWeekStartDate(week)
  const days: DayPreview[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    const memberSet = new Set<MemberTag>()

    records.forEach((record) => {
      const startDate = getRecordStartDate(record)
      if (!startDate || !isSameDay(startDate, date)) return
      getRecordMemberTags(record).forEach((tag) => {
        if (props.memberTags.includes(tag)) {
          memberSet.add(tag)
        }
      })
    })

    const orderedMembers = props.memberTags.filter(tag => memberSet.has(tag))
    const colors = orderedMembers.map(tag => props.tagMeta[tag]?.color).filter(Boolean) as string[]
    const dayLabel = date.toLocaleDateString('zh-CN', { weekday: 'short' })
    const dateLabel = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
    const names = orderedMembers.map(tag => props.tagMeta[tag]?.label ?? tag).join('、')
    const tooltip = orderedMembers.length > 0
      ? `${dayLabel} ${dateLabel}：${names}`
      : `${dayLabel} ${dateLabel}：暂无直播`
    return {
      colors,
      hasLive: orderedMembers.length > 0,
      tooltip,
    }
  })

  return {
    range: getIsoWeekRangeLabel(week, 'zh-CN'),
    days,
  }
}

const loadWeekPreviews = async () => {
  if (isLoadingPreviews.value) return
  isLoadingPreviews.value = true
  const missing = sortedWeeks.value.filter(week => !weekPreviews.value[getIsoWeekKey(week)])
  try {
    await Promise.all(
      missing.map(async (week) => {
        try {
          const records = await getLiveRecordsByWeek(week)
          weekPreviews.value[getIsoWeekKey(week)] = buildWeekPreview(week, records)
        } catch (error) {
          console.error('Failed to load week preview:', error)
          weekPreviews.value[getIsoWeekKey(week)] = buildWeekPreview(week, [])
        }
      })
    )
  } finally {
    isLoadingPreviews.value = false
  }
}

const getWeekPreview = (week: IsoWeek) => {
  const key = getIsoWeekKey(week)
  if (weekPreviews.value[key]) return weekPreviews.value[key]
  return buildWeekPreview(week, [])
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
    loadWeekPreviews()
  }
})
</script>

<template>
  <div class="week-selector">
    <button class="week-selector__nav" :class="{ 'week-selector__nav--disabled': !canGoPrevious }"
      :disabled="!canGoPrevious" @click="goToPreviousWeek" title="上一周">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </button>

    <div ref="currentRef" class="week-selector__current" @click="toggleDropdown">
      <div class="week-selector__label">
        <span class="week-selector__week">{{ currentWeekLabel }}</span>
        <span class="week-selector__range">{{ currentWeekRange }}</span>
      </div>
      <svg class="week-selector__dropdown-icon" :class="{ 'week-selector__dropdown-icon--open': isDropdownOpen }"
        width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>

    </div>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <div v-if="isDropdownOpen" ref="dropdownRef" class="week-selector__dropdown week-selector__dropdown--portal"
        :style="dropdownStyle">
        <div class="week-selector__dropdown-header">选择周</div>
        <div class="week-selector__dropdown-list">
          <button v-for="week in sortedWeeks" :key="getIsoWeekKey(week)" class="week-selector__dropdown-item"
            :class="{ 'week-selector__dropdown-item--active': getIsoWeekKey(week) === currentKey }"
            @click.stop="selectWeek(week)">
            <div class="week-selector__dropdown-item-content">
              <div class="week-selector__dropdown-item-text">
                <span class="week-selector__dropdown-item-label">{{ formatIsoWeekLabel(week) }}</span>
                <span class="week-selector__dropdown-item-range">{{ getWeekPreview(week).range }}</span>
              </div>
              <div class="week-selector__dropdown-item-days">
                <WeekDaySwatch v-for="(day, index) in getWeekPreview(week).days"
                  :key="`${getIsoWeekKey(week)}-${index}`" :colors="day.colors" :title="day.tooltip" />
              </div>
            </div>
            <span v-if="getIsoWeekKey(week) === currentKey" class="week-selector__dropdown-item-check">✓</span>
          </button>
        </div>
      </div>
    </Teleport>

    <button class="week-selector__nav" :class="{ 'week-selector__nav--disabled': !canGoNext }" :disabled="!canGoNext"
      @click="goToNextWeek" title="下一周">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
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
  align-items: flex-start;
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
  gap: 12px;
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
  font-weight: 700;
  font-size: 13px;
  color: var(--ink);
  font-family: var(--font-display);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.week-selector__dropdown-item-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.week-selector__dropdown-item-text {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: nowrap;
}

.week-selector__dropdown-item-range {
  font-size: 11px;
  color: var(--ink-soft);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.week-selector__dropdown-item-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  --swatch-size: 16px;
  --swatch-gap: 1px;
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

  .week-selector__dropdown-item-days {
    gap: 3px;
    --swatch-size: 14px;
  }
}
</style>
