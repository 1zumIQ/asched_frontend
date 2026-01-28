<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { DayCard, TagType } from '@/types/schedule'
import type { WeekIdentifier } from '@/data/utils/scheduleUtils'
import { tagMeta, memberTags, energyTags } from '@/data/schedule'
import { getAvailableWeeks, getWeeklyPlanByWeek } from '@/data/schedule'
import { getCurrentWeekIdentifier, getWeekStartDate } from '@/data/utils/scheduleUtils'
import { ScheduleHero, ScheduleLegend, WeekGrid } from '@/components/schedule'

const now = new Date()

// 当前选中的周
const currentWeek = ref<WeekIdentifier>(getCurrentWeekIdentifier())

// 有数据的周列表
const availableWeeks = ref<WeekIdentifier[]>([])

// 当前周的数据
const weeklyPlan = ref<Record<string, any[]>>({})

// 加载状态
const isLoading = ref(false)

// 选中的标签（用于筛选）
const selectedTags = ref<TagType[]>([])

// 加载有数据的周列表
const loadAvailableWeeks = async () => {
  try {
    availableWeeks.value = await getAvailableWeeks()
  } catch (error) {
    console.error('Failed to load available weeks:', error)
  }
}

// 加载指定周的数据
const loadWeekData = async (weekId: WeekIdentifier) => {
  isLoading.value = true
  try {
    weeklyPlan.value = await getWeeklyPlanByWeek(weekId)
  } catch (error) {
    console.error('Failed to load week data:', error)
    weeklyPlan.value = {}
  } finally {
    isLoading.value = false
  }
}

// 监听周变化
watch(currentWeek, (newWeek) => {
  loadWeekData(newWeek)
})

// 初始化
onMounted(async () => {
  await loadAvailableWeeks()
  await loadWeekData(currentWeek.value)
})

const startOfWeek = computed(() => {
  return getWeekStartDate(currentWeek.value)
})

const endOfWeek = computed(() => {
  const end = new Date(startOfWeek.value)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
})

const weekRangeLabel = computed(() => {
  const start = startOfWeek.value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = endOfWeek.value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${start} - ${end}`
})

// 筛选后的事件
const filteredWeeklyPlan = computed(() => {
  if (selectedTags.value.length === 0) {
    return weeklyPlan.value
  }

  const filtered: Record<string, any[]> = {}
  Object.entries(weeklyPlan.value).forEach(([day, events]) => {
    filtered[day] = events.filter(event =>
      event.tags.some((tag: TagType) => selectedTags.value.includes(tag))
    )
  })
  return filtered
})

const dayCards = computed<DayCard[]>(() => {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek.value)
    date.setDate(startOfWeek.value.getDate() + index)
    const longName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const shortName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const numeric = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const isToday = date.toDateString() === now.toDateString()
    const events = filteredWeeklyPlan.value[longName] ?? []
    return { longName, shortName, numeric, isToday, events }
  })
})

const totalSessions = computed(() =>
  Object.values(weeklyPlan.value).reduce((sum, items) => sum + items.length, 0)
)

const tagCounts = computed(() => {
  const counts = {} as Record<TagType, number>
  Object.values(weeklyPlan.value).forEach((events) => {
    events.forEach((event) => {
      event.tags.forEach((tag: TagType) => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    })
  })
  return counts
})
</script>

<template>
  <main class="page">
    <ScheduleHero
      v-model:current-week="currentWeek"
      v-model:selected-tags="selectedTags"
      :available-weeks="availableWeeks"
      :week-range-label="weekRangeLabel"
      :total-sessions="totalSessions"
      :tag-meta="tagMeta"
      :member-tags="memberTags"
      :type-tags="energyTags"
      :tag-counts="tagCounts"
      :is-loading="isLoading"
    />
    <!-- <ScheduleLegend :tag-meta="tagMeta" /> -->
    <WeekGrid v-if="!isLoading" :day-cards="dayCards" :tag-meta="tagMeta" />
    <div v-else class="loading">
      <div class="loading__spinner"></div>
      <div class="loading__text">加载中...</div>
    </div>
  </main>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

html {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

body {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #faf5ff 100%);
  color: #1e293b;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  height: 100vh;
  overflow: hidden;
}
</style>

<style scoped>
.page {
  height: 100vh;
  padding: 20px clamp(16px, 3vw, 32px);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 移动端减少 padding */
@media (max-width: 768px) {
  .page {
    padding: 8px 8px;
  }
}

/* 高度受限时减少 padding */
@media (max-height: 1000px) {
  .page {
    padding: 12px clamp(8px, 2vw, 16px);
  }
}

@media (max-height: 900px) {
  .page {
    padding: 10px clamp(8px, 2vw, 12px);
  }
}

@media (max-height: 800px) {
  .page {
    padding: 8px clamp(6px, 2vw, 10px);
  }
}

@media (max-height: 700px) {
  .page {
    padding: 6px 8px;
  }
}

@media (max-height: 600px) {
  .page {
    padding: 4px 6px;
  }
}

.loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading__spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading__text {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}
</style>
