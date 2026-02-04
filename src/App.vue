<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { DayCard, TagMeta, TagType, TypeTag, ThemeName } from '@/types/ui'
import { getAvailableWeeks, getLiveRecordsByWeek } from '@/api/schedule'
import type { ApiLiveRecord } from '@/api/schedule'
import { buildLiveRecordView, isSameDay, type LiveRecordView } from '@/domain/records'
import type { IsoWeek } from '@/utils/isoWeek'
import { getCurrentIsoWeek, getIsoWeekRangeLabel, getIsoWeekStartDate } from '@/utils/isoWeek'
import { ScheduleHero, WeekGrid } from '@/components/schedule'
import { parseTagKey } from '@/domain/tagKeys'
import { useScheduleMetaStore } from '@/stores/scheduleMeta'

const now = new Date()
const THEME_STORAGE_KEY = 'asched-theme'

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
const theme = ref<ThemeName>('light')

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
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') {
      theme.value = storedTheme
    }
  } catch (error) {
    console.warn('Failed to load theme preference:', error)
  }
  document.documentElement.dataset.theme = theme.value
  await loadTagData()
  await loadAvailableWeeks()
  await loadWeekData(currentWeek.value)
})

watch(theme, (value) => {
  document.documentElement.dataset.theme = value
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value)
  } catch (error) {
    console.warn('Failed to persist theme preference:', error)
  }
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

const DARK_TINT_BASE = '#0b1020'
const DARK_TINT_MIX = 0.18
const DARK_COLOR_MIX = 0.32

const normalizeHex = (value: string) => {
  const trimmed = value.trim()
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return null
  if (trimmed.length === 4) {
    const [r, g, b] = trimmed.slice(1).split('')
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return trimmed.toLowerCase()
}

const hexToRgb = (hex: string): [number, number, number] | null => {
  const normalized = normalizeHex(hex)
  if (!normalized) return null
  const raw = normalized.slice(1)
  const r = parseInt(raw.slice(0, 2), 16)
  const g = parseInt(raw.slice(2, 4), 16)
  const b = parseInt(raw.slice(4, 6), 16)
  if ([r, g, b].some(Number.isNaN)) return null
  return [r, g, b]
}

const rgbToHex = ([r, g, b]: [number, number, number]) => {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

const mixHex = (baseHex: string, overlayHex: string, ratio: number) => {
  const base = hexToRgb(baseHex)
  const overlay = hexToRgb(overlayHex)
  if (!base || !overlay) return baseHex
  const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)))
  const mix = (baseValue: number, overlayValue: number) => (
    clamp(baseValue * (1 - ratio) + overlayValue * ratio)
  )
  return rgbToHex([
    mix(base[0], overlay[0]),
    mix(base[1], overlay[1]),
    mix(base[2], overlay[2]),
  ])
}

const adjustTagMetaForTheme = (meta: TagMeta, mode: ThemeName): TagMeta => {
  if (mode !== 'dark') return meta
  const colorHex = meta.color ? normalizeHex(meta.color) : null
  const tintHex = meta.tint ? normalizeHex(meta.tint) : null
  if (!colorHex && !tintHex) return meta

  const adjustedColor = colorHex
    ? mixHex(colorHex, '#ffffff', DARK_COLOR_MIX)
    : meta.color
  const tintSource = colorHex ?? tintHex
  const adjustedTint = tintSource
    ? mixHex(DARK_TINT_BASE, tintSource, colorHex ? DARK_TINT_MIX : DARK_TINT_MIX * 0.6)
    : meta.tint

  return {
    ...meta,
    color: adjustedColor,
    tint: adjustedTint,
  }
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

  if (theme.value !== 'dark') return meta

  const adjusted: Record<TagType, TagMeta> = {}
  Object.entries(meta).forEach(([tag, value]) => {
    adjusted[tag as TagType] = adjustTagMetaForTheme(value, theme.value)
  })
  return adjusted
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
      v-model:theme="theme"
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
  --ink-rgb: 47 39 33;
  --ink-deep-rgb: 31 27 22;
  --outline: #5a4d43;
  --outline-rgb: 90 77 67;
  --paper: #fff2b3;
  --paper-2: #fff9db;
  --sun: #ffd166;
  --sun-rgb: 255 209 102;
  --coral: #ff6b6b;
  --coral-rgb: 255 107 107;
  --mint: #06d6a0;
  --mint-rgb: 6 214 160;
  --sky: #4d96ff;
  --sky-rgb: 77 150 255;
  --berry: #ff4fa3;
  --berry-rgb: 255 79 163;
  --leaf: #9ee65c;
  --schedule-accent-warm: var(--sun);
  --schedule-accent-warm-rgb: var(--sun-rgb);
  --schedule-accent-hot: var(--coral);
  --schedule-accent-hot-rgb: var(--coral-rgb);
  --schedule-accent-mint: var(--mint);
  --schedule-accent-mint-rgb: var(--mint-rgb);
  --schedule-accent-cool: var(--sky);
  --schedule-accent-cool-rgb: var(--sky-rgb);
  --schedule-accent-berry: var(--berry);
  --schedule-accent-berry-rgb: var(--berry-rgb);
  --schedule-accent-leaf: var(--leaf);
  --schedule-accent-leaf-rgb: 158 230 92;
  --schedule-rainbow-1: var(--rainbow-1);
  --schedule-rainbow-2: var(--rainbow-2);
  --schedule-rainbow-3: var(--rainbow-3);
  --schedule-rainbow-4: var(--rainbow-4);
  --schedule-rainbow-5: var(--rainbow-5);
  --surface-base: #ffffff;
  --surface-warm: #fff7d6;
  --surface-warm-strong: #fff4b8;
  --surface-warm-deep: #ffe4a5;
  --surface-warm-soft: #fff3c7;
  --surface-sun: #fff2b3;
  --surface-sun-strong: #ffe59a;
  --surface-cool: #dff1ff;
  --surface-cool-soft: #e5f7ff;
  --surface-rose: #ffd1ef;
  --surface-rose-soft: #ffe3f2;
  --surface-mint-soft: #dffaf0;
  --surface-mint-bright: #eafdf6;
  --surface-sunlight: #fff5c2;
  --page-bg-warm: #fff1a6;
  --page-bg-cool: #b9f3ff;
  --page-bg-rose: #ffd1e8;
  --white-rgb: 255 255 255;
  --shadow: rgb(var(--ink-deep-rgb) / 0.25);
  --shadow-strong: rgb(var(--ink-deep-rgb) / 0.38);
  --shadow-ambient-1: rgb(var(--ink-deep-rgb) / 0.16);
  --shadow-ambient-2: rgb(var(--ink-deep-rgb) / 0.2);
  --shadow-ambient-3: rgb(var(--ink-deep-rgb) / 0.22);
  --shadow-ambient-4: rgb(var(--ink-deep-rgb) / 0.28);
  --overlay: rgb(var(--ink-deep-rgb) / 0.5);
  --glass-60: rgb(var(--white-rgb) / 0.6);
  --glass-65: rgb(var(--white-rgb) / 0.65);
  --glass-70: rgb(var(--white-rgb) / 0.7);
  --glass-80: rgb(var(--white-rgb) / 0.8);
  --glass-85: rgb(var(--white-rgb) / 0.85);
  --glass-90: rgb(var(--white-rgb) / 0.9);
  --text-on-accent: #fff;
  --status-ongoing: #10b981;
  --status-ended: #94a3b8;
  --status-interrupted: #ef4444;
  --status-upcoming: var(--schedule-accent-cool);
  --status-late: #f59e0b;
  --status-ongoing-rgb: 16 185 129;
  --status-ended-rgb: 148 163 184;
  --status-interrupted-rgb: 239 68 68;
  --status-upcoming-rgb: var(--schedule-accent-cool-rgb);
  --status-late-rgb: 245 158 11;
  --rainbow-1: #ff6b6b;
  --rainbow-2: #ffd93d;
  --rainbow-3: #6bcb77;
  --rainbow-4: #4d96ff;
  --rainbow-5: #845ef7;
  --radius-xl: 28px 20px 32px 18px;
  --radius-lg: 22px 16px 26px 14px;
  --radius-md: 16px 12px 18px 10px;
  --radius-sm: 12px 10px 14px 8px;
}

:root[data-theme='dark'] {
  --ink: #e6edf7;
  --ink-soft: #9aa9bf;
  --ink-rgb: 230 237 247;
  --ink-deep-rgb: 10 14 24;
  --outline: #2a3b55;
  --outline-rgb: 42 59 85;
  --paper: #0b1020;
  --paper-2: #0f172a;
  --sun: #5fd1ff;
  --sun-rgb: 95 209 255;
  --coral: #ff7a90;
  --coral-rgb: 255 122 144;
  --mint: #2dd4bf;
  --mint-rgb: 45 212 191;
  --sky: #60a5fa;
  --sky-rgb: 96 165 250;
  --berry: #c084fc;
  --berry-rgb: 192 132 252;
  --leaf: #86efac;
  --schedule-accent-warm: var(--sun);
  --schedule-accent-warm-rgb: var(--sun-rgb);
  --schedule-accent-hot: var(--coral);
  --schedule-accent-hot-rgb: var(--coral-rgb);
  --schedule-accent-mint: var(--mint);
  --schedule-accent-mint-rgb: var(--mint-rgb);
  --schedule-accent-cool: var(--sky);
  --schedule-accent-cool-rgb: var(--sky-rgb);
  --schedule-accent-berry: var(--berry);
  --schedule-accent-berry-rgb: var(--berry-rgb);
  --schedule-accent-leaf: var(--leaf);
  --schedule-accent-leaf-rgb: 134 239 172;
  --schedule-rainbow-1: var(--rainbow-1);
  --schedule-rainbow-2: var(--rainbow-2);
  --schedule-rainbow-3: var(--rainbow-3);
  --schedule-rainbow-4: var(--rainbow-4);
  --schedule-rainbow-5: var(--rainbow-5);
  --surface-base: #0f172a;
  --surface-warm: #142033;
  --surface-warm-strong: #1b2a40;
  --surface-warm-deep: #22324a;
  --surface-warm-soft: #111b2b;
  --surface-sun: #1a2740;
  --surface-sun-strong: #22324a;
  --surface-cool: #0b2239;
  --surface-cool-soft: #102a44;
  --surface-rose: #1f1b2e;
  --surface-rose-soft: #1a1726;
  --surface-mint-soft: #0f2724;
  --surface-mint-bright: #12332f;
  --surface-sunlight: #1a2740;
  --page-bg-warm: #0b1120;
  --page-bg-cool: #0b1a2a;
  --page-bg-rose: #1b1024;
  --glass-60: rgb(255 255 255 / 0.08);
  --glass-65: rgb(255 255 255 / 0.1);
  --glass-70: rgb(255 255 255 / 0.12);
  --glass-80: rgb(255 255 255 / 0.16);
  --glass-85: rgb(255 255 255 / 0.18);
  --glass-90: rgb(255 255 255 / 0.22);
  --rainbow-1: #fb7185;
  --rainbow-2: #facc15;
  --rainbow-3: #34d399;
  --rainbow-4: #38bdf8;
  --rainbow-5: #a78bfa;
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
    radial-gradient(circle at 12px 12px, rgb(var(--ink-deep-rgb) / 0.08) 1px, transparent 1px),
    radial-gradient(circle at 6px 6px, var(--glass-60) 1px, transparent 1px),
    linear-gradient(135deg, var(--page-bg-warm) 0%, var(--page-bg-cool) 48%, var(--page-bg-rose) 100%);
  background-size: 24px 24px, 18px 18px, cover;
  background-attachment: fixed;
}

body::before {
  content: '';
  position: fixed;
  inset: -20% -10%;
  background:
    radial-gradient(circle at 12% 18%, var(--glass-60) 0%, rgb(var(--white-rgb) / 0) 45%),
    radial-gradient(
      circle at 82% 8%,
      rgb(var(--schedule-accent-warm-rgb) / 0.35) 0%,
      rgb(var(--schedule-accent-warm-rgb) / 0) 50%
    ),
    radial-gradient(
      circle at 86% 82%,
      rgb(var(--schedule-accent-mint-rgb) / 0.3) 0%,
      rgb(var(--schedule-accent-mint-rgb) / 0) 50%
    );
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
      rgb(var(--ink-deep-rgb) / 0.08) 0px,
      rgb(var(--ink-deep-rgb) / 0.08) 1px,
      transparent 1px,
      transparent 12px
    ),
    repeating-linear-gradient(
      60deg,
      rgb(var(--ink-deep-rgb) / 0.05) 0px,
      rgb(var(--ink-deep-rgb) / 0.05) 1px,
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
  background: rgb(var(--schedule-accent-hot-rgb) / 0.35);
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
  border-top-color: var(--schedule-accent-hot);
  border-right-color: var(--schedule-accent-warm);
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
