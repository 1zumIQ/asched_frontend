<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { DayCard, TagMeta, TagType, TypeTag } from '@/types/ui'
import { getAvailableWeeks, getLiveRecordsByWeek } from '@/data/schedule'
import type { ApiLiveRecord } from '@/data/schedule'
import { buildLiveRecordView, isSameDay, type LiveRecordView } from '@/data/records'
import type { IsoWeek } from '@/data/utils/isoWeek'
import { getCurrentIsoWeek, getIsoWeekRangeLabel, getIsoWeekStartDate } from '@/data/utils/isoWeek'
import { ScheduleHero, WeekGrid } from '@/components/schedule'
import { parseTagKey } from '@/data/tagKeys'
import { useScheduleMetaStore } from '@/stores/scheduleMeta'

const now = new Date()

// 当前选中的周
const currentWeek = ref<IsoWeek>(getCurrentIsoWeek())

const metaStore = useScheduleMetaStore()
const { tagMeta, memberTags, typeTags, isLoading: isMetaLoading } = storeToRefs(metaStore)

// 有数据的周列表
const availableWeeks = ref<IsoWeek[]>([])

// 当前周的数据
const weeklyRecords = ref<ApiLiveRecord[]>([])

// 加载状态
const isLoading = ref(false)

// 选中的标签（用于筛选）
const selectedTags = ref<TagType[]>([])

const isTagDataReady = computed(() => {
  return Object.keys(tagMeta.value).length > 0 && memberTags.value.length > 0
})

const loadTagData = async () => {
  try {
    await metaStore.load()
  } catch (error) {
    console.error('Failed to load tag data:', error)
  }
}

// 加载有数据的周列表
const loadAvailableWeeks = async () => {
  try {
    availableWeeks.value = await getAvailableWeeks()
  } catch (error) {
    console.error('Failed to load available weeks:', error)
  }
}

// 加载指定周的数据
const loadWeekData = async (week: IsoWeek) => {
  isLoading.value = true
  try {
    weeklyRecords.value = await getLiveRecordsByWeek(week)
  } catch (error) {
    console.error('Failed to load week data:', error)
    weeklyRecords.value = []
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
  await loadTagData()
  await loadAvailableWeeks()
  await loadWeekData(currentWeek.value)
})

const startOfWeek = computed(() => getIsoWeekStartDate(currentWeek.value))

const weekRangeLabel = computed(() => getIsoWeekRangeLabel(currentWeek.value, 'en-US'))

const scheduleEvents = computed<LiveRecordView[]>(() => {
  return weeklyRecords.value
    .map(record => buildLiveRecordView(record))
    .filter((event): event is LiveRecordView => Boolean(event))
})

const effectiveTypeTags = computed<TypeTag[]>(() => {
  const tags = new Set<TypeTag>(typeTags.value)
  scheduleEvents.value.forEach((event) => {
    tags.add(event.typeTag)
  })
  return [...tags]
})

const FALLBACK_META = {
  color: '#5a4d43',
  tint: '#f0e9e2',
}

const buildFallbackTagMeta = (tag: TagType): TagMeta => {
  const parsed = parseTagKey(tag)
  return {
    id: parsed.id,
    kind: parsed.kind,
    label: parsed.kind === 'member' ? `MID:${parsed.id}` : `类型 ${parsed.id}`,
    color: FALLBACK_META.color,
    tint: FALLBACK_META.tint,
  }
}

const effectiveTagMeta = computed<Record<TagType, TagMeta>>(() => {
  const meta: Record<TagType, TagMeta> = { ...tagMeta.value }
  const ensure = (tag: TagType) => {
    if (!meta[tag]) meta[tag] = buildFallbackTagMeta(tag)
  }
  memberTags.value.forEach(ensure)
  effectiveTypeTags.value.forEach(ensure)
  scheduleEvents.value.forEach((event) => {
    event.tagKeys.forEach(ensure)
  })
  return meta
})

const filteredEvents = computed<LiveRecordView[]>(() => {
  if (selectedTags.value.length === 0) return scheduleEvents.value
  return scheduleEvents.value.filter(event =>
    event.tagKeys.some(tag => selectedTags.value.includes(tag))
  )
})

const dayCards = computed<DayCard<LiveRecordView>[]>(() => {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek.value)
    date.setDate(startOfWeek.value.getDate() + index)
    const longName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const shortName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const numeric = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const isToday = date.toDateString() === now.toDateString()
    const events = filteredEvents.value
      .filter(event => isSameDay(event.startDate, date))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    return { longName, shortName, numeric, isToday, events }
  })
})

const totalSessions = computed(() => weeklyRecords.value.length)

const tagCounts = computed(() => {
  const counts = {} as Record<TagType, number>
  scheduleEvents.value.forEach((event) => {
    event.tagKeys.forEach((tag: TagType) => {
      counts[tag] = (counts[tag] || 0) + 1
    })
  })
  return counts
})
</script>

<template>
  <main class="page">
    <ScheduleHero v-if="isTagDataReady"
      v-model:current-week="currentWeek"
      v-model:selected-tags="selectedTags"
      :available-weeks="availableWeeks"
      :week-range-label="weekRangeLabel"
      :total-sessions="totalSessions"
      :tag-meta="effectiveTagMeta"
      :member-tags="memberTags"
      :type-tags="effectiveTypeTags"
      :tag-counts="tagCounts"
      :is-loading="isLoading || isMetaLoading"
    />
    <!-- <ScheduleLegend :tag-meta="tagMeta" :member-tags="memberTags" /> -->
    <WeekGrid v-if="isTagDataReady && !isLoading" :day-cards="dayCards" :tag-meta="effectiveTagMeta" :member-tags="memberTags" :type-tags="effectiveTypeTags" />
    <div v-else class="loading">
      <div class="loading__spinner"></div>
      <div class="loading__text">加载中...</div>
    </div>
  </main>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

:root {
  --font-display: 'Fredoka', 'Noto Sans SC', sans-serif;
  --font-body: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --ink: #2f2721;
  --ink-soft: #61564d;
  --outline: #5a4d43;
  --shadow: rgba(47, 39, 33, 0.26);
  --shadow-strong: rgba(47, 39, 33, 0.38);
  --paper: #fff2b3;
  --paper-2: #fff9db;
  --sun: #ffd166;
  --coral: #ff6b6b;
  --mint: #06d6a0;
  --sky: #4d96ff;
  --berry: #ff4fa3;
  --leaf: #9ee65c;
  --shadow: rgba(31, 27, 22, 0.25);
  --radius-xl: 28px 20px 32px 18px;
  --radius-lg: 22px 16px 26px 14px;
  --radius-md: 16px 12px 18px 10px;
  --radius-sm: 12px 10px 14px 8px;
}

html {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  color: var(--ink);
  font-family: var(--font-body);
  background-color: var(--paper);
  background-image:
    radial-gradient(circle at 12px 12px, rgba(31, 27, 22, 0.08) 1px, transparent 1px),
    radial-gradient(circle at 6px 6px, rgba(255, 255, 255, 0.6) 1px, transparent 1px),
    linear-gradient(135deg, #fff1a6 0%, #b9f3ff 48%, #ffd1e8 100%);
  background-size: 24px 24px, 18px 18px, cover;
  background-attachment: fixed;
}

body::before {
  content: '';
  position: fixed;
  inset: -20% -10%;
  background:
    radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 45%),
    radial-gradient(circle at 82% 8%, rgba(255, 209, 102, 0.35) 0%, rgba(255, 209, 102, 0) 50%),
    radial-gradient(circle at 86% 82%, rgba(6, 214, 160, 0.3) 0%, rgba(6, 214, 160, 0) 50%);
  opacity: 0.8;
  pointer-events: none;
  z-index: 0;
}

body::after {
  content: '';
  position: fixed;
  inset: -10%;
  background-image:
    repeating-linear-gradient(
      120deg,
      rgba(31, 27, 22, 0.08) 0px,
      rgba(31, 27, 22, 0.08) 1px,
      transparent 1px,
      transparent 12px
    ),
    repeating-linear-gradient(
      60deg,
      rgba(31, 27, 22, 0.05) 0px,
      rgba(31, 27, 22, 0.05) 1px,
      transparent 1px,
      transparent 14px
    );
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}

#app {
  height: 100%;
  position: relative;
  z-index: 1;
}

button,
input,
select,
textarea {
  font-family: var(--font-body);
}

h1,
h2,
h3,
h4 {
  font-family: var(--font-display);
}

::selection {
  background: rgba(255, 107, 107, 0.35);
  color: var(--ink);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>

<style scoped>
.page {
  height: 100vh;
  padding: 20px clamp(16px, 3vw, 32px);
  box-sizing: border-box;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  isolation: isolate;
}

.page::before {
  content: '';
  position: absolute;
  top: 16px;
  right: 10%;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 70%);
  filter: blur(2px);
  z-index: -1;
}

.page::after {
  content: '';
  position: absolute;
  bottom: 16px;
  left: 6%;
  width: 180px;
  height: 180px;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 107, 107, 0.3), transparent 55%),
    radial-gradient(circle at 70% 70%, rgba(77, 150, 255, 0.3), transparent 55%);
  filter: blur(4px);
  z-index: -1;
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
  border-radius: var(--radius-lg);
  border: 2px solid var(--outline);
  background: rgba(255, 255, 255, 0.75);
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 16px 30px rgba(31, 27, 22, 0.18);
  padding: 24px;
}

.loading__spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--outline);
  border-top-color: var(--coral);
  border-right-color: var(--sun);
  border-radius: 40% 60% 50% 50%;
  animation: spin 1s linear infinite;
  box-shadow: 3px 3px 0 var(--shadow);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading__text {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: 0.04em;
}
</style>

