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

const DARK_TINT_BASE = '#05080f'
const DARK_TINT_MIX = 0.14
const DARK_COLOR_MIX = 0.28

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
  color-scheme: light dark;
}

:root:not([data-theme]),
:root[data-theme='light'] {
  /* ========== CUTE HAND-DRAWN STYLE ========== */
  --font-display: 'Fredoka', 'Noto Sans SC', sans-serif;
  --font-body: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;

  /* Soft pastel ink colors */
  --ink: #4a3f36;
  --ink-soft: #7a6b5f;
  --ink-rgb: 74 63 54;
  --ink-deep-rgb: 45 38 32;

  /* Hand-drawn outline - slightly softer */
  --outline: #6b5a4d;
  --outline-rgb: 107 90 77;

  /* Warm paper tones */
  --paper: #fff8e7;
  --paper-2: #fffbf0;

  /* Cheerful accent colors */
  --sun: #ffdb70;
  --sun-rgb: 255 219 112;
  --coral: #ff8a8a;
  --coral-rgb: 255 138 138;
  --mint: #5ee9c5;
  --mint-rgb: 94 233 197;
  --sky: #7ab8ff;
  --sky-rgb: 122 184 255;
  --berry: #ff7eb8;
  --berry-rgb: 255 126 184;
  --leaf: #a8ed6c;
  --peach: #ffb5a0;
  --peach-rgb: 255 181 160;
  --lavender: #c9b8ff;
  --lavender-rgb: 201 184 255;

  /* Schedule accent mappings */
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
  --schedule-accent-leaf-rgb: 168 237 108;
  --schedule-rainbow-1: var(--rainbow-1);
  --schedule-rainbow-2: var(--rainbow-2);
  --schedule-rainbow-3: var(--rainbow-3);
  --schedule-rainbow-4: var(--rainbow-4);
  --schedule-rainbow-5: var(--rainbow-5);

  /* Soft creamy surfaces */
  --surface-base: #fffefa;
  --surface-warm: #fff9e8;
  --surface-warm-strong: #fff5d6;
  --surface-warm-deep: #ffedbe;
  --surface-warm-soft: #fffbef;
  --surface-sun: #fff7d9;
  --surface-sun-strong: #ffefb8;
  --surface-cool: #e8f5ff;
  --surface-cool-soft: #f0f9ff;
  --surface-rose: #ffe8f5;
  --surface-rose-soft: #fff0f8;
  --surface-mint-soft: #e8fff7;
  --surface-mint-bright: #f0fff9;
  --surface-sunlight: #fffae0;

  /* Dreamy pastel backgrounds */
  --page-bg-warm: #fff5d4;
  --page-bg-cool: #d4f4ff;
  --page-bg-rose: #ffe8f2;

  --white-rgb: 255 255 255;

  /* Soft shadows for cute feel */
  --shadow: rgb(var(--ink-deep-rgb) / 0.18);
  --shadow-strong: rgb(var(--ink-deep-rgb) / 0.28);
  --shadow-ambient-1: rgb(var(--ink-deep-rgb) / 0.12);
  --shadow-ambient-2: rgb(var(--ink-deep-rgb) / 0.15);
  --shadow-ambient-3: rgb(var(--ink-deep-rgb) / 0.18);
  --shadow-ambient-4: rgb(var(--ink-deep-rgb) / 0.22);
  --overlay: rgb(var(--ink-deep-rgb) / 0.4);

  /* Frosted glass effects */
  --glass-60: rgb(var(--white-rgb) / 0.65);
  --glass-65: rgb(var(--white-rgb) / 0.7);
  --glass-70: rgb(var(--white-rgb) / 0.75);
  --glass-80: rgb(var(--white-rgb) / 0.85);
  --glass-85: rgb(var(--white-rgb) / 0.88);
  --glass-90: rgb(var(--white-rgb) / 0.92);

  --text-on-accent: #fff;

  /* Status colors - cheerful */
  --status-ongoing: #2dd4a0;
  --status-ended: #a8b4c2;
  --status-interrupted: #ff7b7b;
  --status-upcoming: var(--schedule-accent-cool);
  --status-late: #ffb347;
  --status-ongoing-rgb: 45 212 160;
  --status-ended-rgb: 168 180 194;
  --status-interrupted-rgb: 255 123 123;
  --status-upcoming-rgb: var(--schedule-accent-cool-rgb);
  --status-late-rgb: 255 179 71;

  /* Rainbow palette - soft pastel */
  --rainbow-1: #ff8a8a;
  --rainbow-2: #ffdb70;
  --rainbow-3: #7cd992;
  --rainbow-4: #7ab8ff;
  --rainbow-5: #b088f9;

  /* Organic hand-drawn border radii */
  --radius-xl: 32px 24px 36px 20px;
  --radius-lg: 26px 18px 30px 16px;
  --radius-md: 18px 14px 22px 12px;
  --radius-sm: 14px 10px 16px 8px;

  /* Cute theme specific */
  --sparkle-color: #ffeb3b;
  --blush-color: rgb(255 180 180 / 0.4);
  --doodle-opacity: 0.08;
  --wiggle-intensity: 2deg;
  --bounce-scale: 1.05;
}

:root[data-theme='dark'] {
  /* ========== SHADCN/UI MINIMALIST STYLE (ZINC - OPTIMIZED) ========== */
  --font-display: 'Fredoka', 'Noto Sans SC', sans-serif;
  --font-body: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;

  /* High contrast text */
  --ink: #f4f4f5;         /* Zinc 100 - Slightly softer white */
  --ink-soft: #a1a1aa;    /* Zinc 400 */
  --ink-rgb: 244 244 245;
  --ink-deep-rgb: 12 12 16; /* Deep charcoal */

  /* Subtle high-contrast borders */
  --outline: #27272a;     /* Zinc 800 */
  --outline-rgb: 39 39 42;

  /* Clean dark backgrounds - LIFTED from pure black */
  --paper: #0c0c10;       /* Custom darker gray, not pure black */
  --paper-2: #18181b;     /* Zinc 900 */

  /* Muted accents for minimalist feel */
  --sun: #fbbf24;         /* Amber 400 */
  --sun-rgb: 251 191 36;
  --coral: #f43f5e;       /* Rose 500 */
  --coral-rgb: 244 63 94;
  --mint: #10b981;        /* Emerald 500 */
  --mint-rgb: 16 185 129;
  --sky: #38bdf8;         /* Sky 400 */
  --sky-rgb: 56 189 248;
  --berry: #a78bfa;       /* Violet 400 */
  --berry-rgb: 167 139 250;
  --leaf: #a3e635;        /* Lime 400 */
  --blood: #e11d48;       /* Rose 600 */
  --blood-rgb: 225 29 72;
  --ghostblue: #94a3b8;   /* Slate 400 */
  --ghostblue-rgb: 148 163 184;
  --toxic: #84cc16;       /* Lime 500 */
  --toxic-rgb: 132 204 22;

  /* Schedule accent mappings */
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
  --schedule-accent-leaf-rgb: 163 230 53;
  --schedule-rainbow-1: #fda4af;
  --schedule-rainbow-2: #fdba74;
  --schedule-rainbow-3: #86efac;
  --schedule-rainbow-4: #93c5fd;
  --schedule-rainbow-5: #c4b5fd;

  /* Zinc surfaces - INCREASED BRIGHTNESS for depth */
  --surface-base: #131316;      /* Slightly lighter than bg */
  --surface-warm: #18181b;      /* Zinc 900 */
  --surface-warm-strong: #27272a; /* Zinc 800 */
  --surface-warm-deep: #18181b; /* Zinc 900 */
  --surface-warm-soft: #131316;
  --surface-sun: #18181b;
  --surface-sun-strong: #27272a;
  --surface-cool: #131316;
  --surface-cool-soft: #18181b;
  --surface-rose: #131316;
  --surface-rose-soft: #18181b;
  --surface-mint-soft: #131316;
  --surface-mint-bright: #18181b;
  --surface-sunlight: #131316;

  /* Clean background gradients (subtle) */
  --page-bg-warm: #0c0c10;
  --page-bg-cool: #131316;
  --page-bg-rose: #0c0c10;

  --white-rgb: 255 255 255;

  /* Enhanced shadows for better separation on dark */
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.2);
  --shadow-strong: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.2);
  --shadow-ambient-1: 0 10px 15px -3px rgb(0 0 0 / 0.3);
  --shadow-ambient-2: 0 20px 25px -5px rgb(0 0 0 / 0.3);
  --shadow-ambient-3: 0 25px 50px -12px rgb(0 0 0 / 0.4);
  --shadow-ambient-4: var(--shadow-ambient-3);
  --overlay: rgb(0 0 0 / 0.7);

  /* Clearer glass */
  --glass-60: rgb(24 24 27 / 0.6);
  --glass-65: rgb(24 24 27 / 0.65);
  --glass-70: rgb(24 24 27 / 0.7);
  --glass-80: rgb(24 24 27 / 0.8);
  --glass-85: rgb(24 24 27 / 0.85);
  --glass-90: rgb(24 24 27 / 0.9);

  --text-on-accent: #ffffff;

  /* Status colors */
  --status-ongoing: #10b981;
  --status-ended: #71717a;
  --status-interrupted: #ef4444;
  --status-upcoming: #3b82f6;
  --status-late: #f59e0b;
  --status-ongoing-rgb: 16 185 129;
  --status-ended-rgb: 113 113 122;
  --status-interrupted-rgb: 239 68 68;
  --status-upcoming-rgb: 59 130 246;
  --status-late-rgb: 245 158 11;

  /* Standard borders */
  --radius-xl: 12px;
  --radius-lg: 8px;
  --radius-md: 6px;
  --radius-sm: 4px;

  /* Removed horror variables */
  --eerie-glow: transparent;
  --fog-opacity: 0;
  --flicker-intensity: 0;
  --shake-intensity: 0;
  --crack-opacity: 0;
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
  /* Clean background for both themes, texture only in light */
  background-image: none;
  background-size: auto;
  background-attachment: fixed;
}

/* Light mode texture restoration */
:root[data-theme='light'] body {
  background-image:
    radial-gradient(circle at 12px 12px, rgb(var(--ink-deep-rgb) / 0.08) 1px, transparent 1px),
    radial-gradient(circle at 6px 6px, var(--glass-60) 1px, transparent 1px),
    linear-gradient(135deg, var(--page-bg-warm) 0%, var(--page-bg-cool) 48%, var(--page-bg-rose) 100%);
  background-size: 24px 24px, 18px 18px, cover;
}

/* Clean up body::before/after for dark mode */
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

/* Hide colorful blobs in dark mode */
:root[data-theme='dark'] body::before {
  display: none;
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

/* Hide texture grid in dark mode */
:root[data-theme='dark'] body::after {
  display: none;
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
    radial-gradient(circle at 30% 30%, rgb(var(--schedule-accent-hot-rgb) / 0.22), transparent 55%),
    radial-gradient(circle at 70% 70%, rgb(var(--schedule-accent-cool-rgb) / 0.22), transparent 55%);
  filter: blur(4px);
  z-index: -1;
}

/* Dark mode - Clean page, no eerie decorations */
:root[data-theme='dark'] .page::before,
:root[data-theme='dark'] .page::after {
  display: none;
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

:root[data-theme='dark'] .loading {
  background: linear-gradient(145deg, var(--surface-base) 0%, var(--surface-warm) 100%);
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 16px 30px var(--shadow-ambient-3);
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
