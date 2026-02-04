<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { TagType, TagMeta, TypeTag } from '@/types/ui'
import type { LiveRecordView } from '@/domain/records'

type EventStatusKey = 'ongoing' | 'ended' | 'interrupted' | 'upcoming' | 'late'
type DotStatusKey = 'ongoing' | 'ended' | 'upcoming'

const STATUS_META: Record<
  number,
  {
    status: EventStatusKey
    label: string
    dot: DotStatusKey
    tone: { color: string; glow: string }
  }
> = {
  0: {
    status: 'ongoing',
    label: '直播中',
    dot: 'ongoing',
    tone: {
      color: 'var(--status-ongoing)',
      glow: 'rgb(var(--status-ongoing-rgb) / 0.3)',
    },
  },
  1: {
    status: 'ended',
    label: '已结束',
    dot: 'ended',
    tone: {
      color: 'var(--status-ended)',
      glow: 'rgb(var(--status-ended-rgb) / 0.3)',
    },
  },
  2: {
    status: 'interrupted',
    label: '中断',
    dot: 'upcoming',
    tone: {
      color: 'var(--status-interrupted)',
      glow: 'rgb(var(--status-interrupted-rgb) / 0.3)',
    },
  },
  3: {
    status: 'upcoming',
    label: '未开始',
    dot: 'upcoming',
    tone: {
      color: 'var(--status-upcoming)',
      glow: 'rgb(var(--sky-rgb) / 0.3)',
    },
  },
  4: {
    status: 'late',
    label: '迟到',
    dot: 'upcoming',
    tone: {
      color: 'var(--status-late)',
      glow: 'rgb(var(--status-late-rgb) / 0.3)',
    },
  },
}

const DEFAULT_STATUS = {
  status: 'upcoming' as EventStatusKey,
  label: '',
  dot: 'upcoming' as DotStatusKey,
  tone: {
    color: 'var(--status-upcoming)',
    glow: 'rgb(var(--sky-rgb) / 0.3)',
  },
}

const FALLBACK_TAG_META: TagMeta = {
  id: 0,
  kind: 'member',
  label: 'Unknown',
  color: 'var(--outline)',
  tint: 'var(--surface-base)',
}

const props = defineProps<{
  event: LiveRecordView
  tagMeta: Record<TagType, TagMeta>
  typeTags: TypeTag[]
}>()

const isExpanded = shallowRef(false)

const avatarInitials = computed(() => {
  const words = props.event.record.title.split(' ')
  if (words.length >= 2 && words[0] && words[1] && words[0][0] && words[1][0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return props.event.record.title.slice(0, 2).toUpperCase()
})

// 获取主分类标签（第一个成员标签）
const primaryTag = computed<TagType>(() => {
  if (props.event.memberTags[0]) return props.event.memberTags[0]
  if (props.event.typeTag) return props.event.typeTag
  return props.event.tagKeys[0] ?? props.event.memberTags[0]
})

const primaryMeta = computed(() => (
  props.tagMeta[primaryTag.value] ?? FALLBACK_TAG_META
))

// 获取类型标签
const typeTag = computed(() => {
  return props.event.typeTag
})

const typeTagSet = computed(() => new Set(props.typeTags))

const isTypeTag = (tag: TagType): tag is TypeTag => typeTagSet.value.has(tag as TypeTag)

const typeIcon = computed(() => {
  if (!typeTag.value) return '📝'
  return props.tagMeta[typeTag.value]?.icon ?? '📝'
})

const statusMeta = computed(() => (
  STATUS_META[props.event.record.status] ?? DEFAULT_STATUS
))

// 使用后端提供的状态
const eventStatus = computed(() => statusMeta.value.status)

const dotStatus = computed(() => statusMeta.value.dot)

// 获取状态标签
const statusLabel = computed(() => statusMeta.value.label)

// 获取状态颜色
const statusTone = computed(() => statusMeta.value.tone)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const formatIsoTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// 计算进度（如果正在进行中且有结束时间）
const progress = computed(() => {
  if (props.event.record.status !== 0 || !props.event.record.end_time) return 0

  const now = new Date()
  const startDate = new Date(props.event.record.start_time)
  const endDate = new Date(props.event.record.end_time)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0

  const duration = endDate.getTime() - startDate.getTime()
  const elapsed = now.getTime() - startDate.getTime()

  return Math.min(100, Math.max(0, (elapsed / duration) * 100))
})

// 持续时间显示
const durationText = computed(() => {
  if (props.event.record.end_time) {
    const endTime = formatIsoTime(props.event.record.end_time)
    return `${props.event.timeLabel} - ${endTime}`
  }
  return `${props.event.timeLabel} (预计2小时)`
})

const guestNames = computed(() => {
  return props.event.memberTags
    .slice(1)
    .map(tag => props.tagMeta[tag]?.label ?? tag)
})
</script>

<template>
  <div class="event" :class="{
    'event--starting-soon': eventStatus === 'starting-soon',
    'event--ongoing': eventStatus === 'ongoing',
    'event--ended': eventStatus === 'ended',
    'event--expanded': isExpanded
  }" :style="{
      '--primary-color': primaryMeta.color
    }" @click="toggleExpanded">
    <!-- 进度条 -->
    <div v-if="eventStatus === 'ongoing'" class="event__progress-bar">
      <div class="event__progress-fill" :style="{
        width: `${progress}%`,
        backgroundColor: statusTone.color
      }"></div>
    </div>

    <div class="event__content">
      <div class="event__left">
        <div class="event__time-wrapper">
          <div class="event__time">{{ event.timeLabel }}</div>
          <!-- 状态指示器移到时间旁边 -->
          <div v-if="statusLabel" class="event__status" :style="{
            backgroundColor: statusTone.color,
            boxShadow: `0 0 8px ${statusTone.glow}`
          }">
            <span class="event__status-pulse" :style="{ backgroundColor: statusTone.color }"></span>
            {{ statusLabel }}
          </div>
          <div v-if="isExpanded" class="event__duration">{{ durationText }}</div>
        </div>
        <div class="event__body">
          <div class="event__title">
            <span
              class="dot"
              :class="`dot--${dotStatus}`"
              :style="{ backgroundColor: primaryMeta.color, color: statusTone.color }"
            ></span>
            <div class="event__title-content">
              <div class="event__name">{{ event.record.title }}</div>

            </div>
          </div>
        </div>
      </div>
      <div class="avatar" :style="{
        backgroundColor: primaryMeta.tint,
        color: primaryMeta.color,
        borderColor: primaryMeta.color,
        backgroundImage: primaryMeta.avatar ? `url(${primaryMeta.avatar})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }">
        <span v-if="!primaryMeta.avatar">{{ avatarInitials }}</span>
      </div>
    </div>

    <!-- 展开时显示嘉宾信息 -->
    <div v-if="isExpanded && guestNames.length > 0" class="event__guests">
      <span class="event__guests-label">👥 嘉宾：</span>
      <span class="event__guests-list">{{ guestNames.join('、') }}</span>
    </div>

    <!-- 标签独立成行，占满整个宽度 -->
    <div class="event__tags">
      <span
        v-for="tag in event.tagKeys"
        :key="tag"
        class="chip"
        :class="{ 'chip--type': isTypeTag(tag) }"
        :style="{
          borderColor: tagMeta[tag].color,
          color: tagMeta[tag].color,
          backgroundColor: tagMeta[tag].tint,
        }">
        <span v-if="isTypeTag(tag)" class="chip__icon">
          {{ typeIcon }}
        </span>
        {{ tagMeta[tag].label }}
      </span>
    </div>

    <!-- 展开指示器 -->
    <div class="event__expand-indicator">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
        :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }">
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.event {
  padding: 14px;
  border-radius: var(--radius-md);
  border: 2px solid var(--outline);
  --event-surface: linear-gradient(145deg, var(--surface-base) 0%, var(--surface-warm) 100%);
  --event-surface-hover: linear-gradient(
    145deg,
    var(--surface-base) 0%,
    var(--surface-rose-soft) 100%
  );
  --event-surface-soon: linear-gradient(
    145deg,
    var(--surface-warm-soft) 0%,
    var(--surface-warm) 50%,
    var(--surface-base) 100%
  );
  --event-surface-ongoing: linear-gradient(
    145deg,
    var(--surface-mint-soft) 0%,
    var(--surface-mint-bright) 40%,
    var(--surface-base) 100%
  );
  --event-time-bg: linear-gradient(135deg, var(--surface-sun), var(--surface-warm));
  --event-time-bg-hover: linear-gradient(135deg, var(--surface-rose), var(--surface-warm));
  --event-guests-bg: linear-gradient(135deg, var(--surface-base), var(--surface-warm));
  --event-expand-bg: rgb(var(--white-rgb) / 0.7);
  background:
    radial-gradient(circle at 10px 10px, rgb(var(--ink-deep-rgb) / 0.05) 1px, transparent 1px),
    var(--event-surface);
  background-size: 22px 22px, cover;
  box-shadow:
    3px 3px 0 var(--shadow-strong),
    0 8px 14px rgb(var(--ink-deep-rgb) / 0.14);
  transition:
    all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

/* 高度受限时减少内边距 */
@media (max-height: 800px) {
  .event {
    padding: 10px;
  }
}

@media (max-height: 700px) {
  .event {
    padding: 8px;
  }
}

.event::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(180deg, var(--primary-color, var(--coral)), transparent);
  opacity: 0.7;
}

.event:hover {
  transform: translate(-2px, -2px) rotate(-0.4deg) scale(1.01);
  background: var(--event-surface-hover);
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    0 12px 18px rgb(var(--ink-deep-rgb) / 0.18);
}

.event:active {
  transform: translate(0, 0) scale(0.99);
}

/* 状态样式 */
.event--starting-soon {
  border-color: var(--outline);
  background: var(--event-surface-soon);
}

.event--ongoing {
  border-color: var(--outline);
  background: var(--event-surface-ongoing);
  animation: pulse-ongoing 2s ease-in-out infinite;
}

@keyframes pulse-ongoing {

  0%,
  100% {
    box-shadow:
      3px 3px 0 var(--shadow-strong),
      0 10px 16px rgb(var(--mint-rgb) / 0.22);
  }

  50% {
    box-shadow:
      4px 4px 0 var(--shadow-strong),
      0 12px 20px rgb(var(--mint-rgb) / 0.28);
  }
}

.event--ended {
  opacity: 0.65;
  filter: grayscale(0.2);
}

.event--expanded {
  padding-bottom: 20px;
}

/* 状态指示器 */
.event__status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  color: var(--text-on-accent);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  animation: status-appear 300ms ease-out;
  flex-shrink: 0;
  border: 2px solid var(--outline);
  box-shadow: 2px 2px 0 var(--shadow);
}

@keyframes status-appear {
  from {
    opacity: 0;
    transform: translateX(-10px) scale(0.8);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.event__status-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  position: relative;
  animation: pulse-dot 2s ease-in-out infinite;
  flex-shrink: 0;
}

.event__status-pulse::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0;
  animation: pulse-ring-status 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-dot {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes pulse-ring-status {
  0% {
    opacity: 0.8;
    transform: scale(0.8);
  }

  100% {
    opacity: 0;
    transform: scale(1.8);
  }
}

/* 进度条 */
.event__progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: rgb(var(--ink-deep-rgb) / 0.12);
  overflow: hidden;
}

.event__progress-fill {
  height: 100%;
  transition: width 1s ease-out;
  position: relative;
  overflow: hidden;
}

.event__progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, var(--glass-60), transparent);
  animation: progress-shimmer 2s infinite;
}

@keyframes progress-shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.event__content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.event__left {
  flex: 1;
  min-width: 0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 45% 55% 48% 52%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  border: 2px solid var(--outline);
  flex-shrink: 0;
  box-shadow:
    3px 3px 0 var(--shadow-strong),
    0 10px 16px var(--shadow-ambient-2),
    inset 0 1px 0 var(--glass-60);
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.avatar::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgb(var(--white-rgb) / 0.3), transparent);
  transform: rotate(45deg);
  animation: avatar-shine 3s infinite;
}

@keyframes avatar-shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }

  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.event:hover .avatar {
  transform: scale(1.1) rotate(7deg);
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    0 14px 20px rgb(var(--ink-deep-rgb) / 0.25),
    inset 0 1px 0 var(--glass-70);
}

.event__time-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.event__time {
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--event-time-bg);
  border: 2px solid var(--outline);
  transition: all 200ms ease;
  flex-shrink: 0;
  box-shadow: 2px 2px 0 var(--shadow);
}

.event__time::before {
  content: '🕐';
  font-size: 14px;
}

.event:hover .event__time {
  background: var(--event-time-bg-hover);
  border-color: var(--outline);
  color: var(--ink);
  transform: translate(-2px, -2px);
}

.event__duration {
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 500;
  animation: fade-in 300ms ease-out;
  flex-basis: 100%;
  padding-left: 0;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.event__title {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
}

.event__title-content {
  flex: 1;
  min-width: 0;
}

.event__name {
  font-weight: 700;
  color: var(--ink);
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  transition: color 200ms ease;
  letter-spacing: 0.01em;
  font-family: var(--font-display);
}

.event:hover .event__name {
  color: var(--primary-color, var(--sky));
}

.event__meta {
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.6;
  margin-top: 3px;
  font-weight: 500;
}

/* 高度受限时隐藏元信息 */
@media (max-height: 700px) {
  .event__meta {
    display: none;
  }
}

.event__guests {
  margin-top: 6px;
  margin-bottom: 6px;
  padding: 8px 12px;
  background: var(--event-guests-bg);
  border-radius: var(--radius-sm);
  border: 2px dashed rgb(var(--outline-rgb) / 0.25);
  font-size: 12px;
  animation: fade-in 300ms ease-out;
}

.event__guests-label {
  font-weight: 700;
  color: var(--ink);
  margin-right: 4px;
}

.event__guests-list {
  color: var(--ink-soft);
  font-weight: 500;
}

.event__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  box-shadow:
    0 0 0 3px var(--glass-90),
    2px 2px 0 var(--shadow);
  transition: all 200ms ease;
  position: relative;
  border: 2px solid var(--outline);
}

.dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0;
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.dot--ongoing {
  box-shadow:
    0 0 0 3px rgb(var(--mint-rgb) / 0.2),
    2px 2px 0 var(--shadow);
  animation: dot-breathe 1.6s ease-in-out infinite;
}

.dot--ongoing::after {
  opacity: 0.7;
  animation: pulse-ring-strong 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.dot--ended {
  opacity: 0.5;
  filter: grayscale(0.4);
  box-shadow:
    0 0 0 2px rgb(var(--status-ended-rgb) / 0.3),
    2px 2px 0 rgb(var(--ink-deep-rgb) / 0.3);
}

.dot--ended::after {
  animation: none;
  opacity: 0;
}

.dot--upcoming {
  box-shadow:
    0 0 0 2px rgb(var(--sky-rgb) / 0.2),
    2px 2px 0 rgb(var(--ink-deep-rgb) / 0.3);
}

.dot--upcoming::after {
  opacity: 0.4;
  animation: pulse-ring-soft 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-ring {
  0% {
    opacity: 0.6;
    transform: scale(0.8);
  }

  100% {
    opacity: 0;
    transform: scale(1.4);
  }
}

@keyframes pulse-ring-strong {
  0% {
    opacity: 0.85;
    transform: scale(0.7);
  }
  100% {
    opacity: 0;
    transform: scale(1.6);
  }
}

@keyframes pulse-ring-soft {
  0% {
    opacity: 0.5;
    transform: scale(0.85);
  }
  100% {
    opacity: 0;
    transform: scale(1.35);
  }
}

@keyframes dot-breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.event:hover .dot {
  transform: scale(1.2);
  box-shadow:
    0 0 0 4px var(--surface-base),
    3px 3px 0 var(--shadow-strong);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 700;
  border: 2px solid var(--outline);
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  box-shadow: 2px 2px 0 var(--shadow);
  position: relative;
  overflow: hidden;
}

.chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgb(var(--white-rgb) / 0.4), transparent);
  transition: left 300ms ease;
}

.chip:hover {
  transform: translate(-2px, -2px) scale(1.04);
  box-shadow: 3px 3px 0 var(--shadow-strong);
}

.chip:hover::before {
  left: 100%;
}

.chip__icon {
  font-size: 13px;
  filter: drop-shadow(0 1px 2px rgb(var(--ink-deep-rgb) / 0.1));
}

.chip--type {
  border-radius: 999px;
  padding: 4px 12px;
  font-weight: 800;
}

/* 展开指示器 */
.event__expand-indicator {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--ink-soft);
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--event-expand-bg);
  border: 2px dashed rgb(var(--outline-rgb) / 0.3);

}

.event__expand-indicator svg {
  transition: transform 200ms ease;
}

.event:hover .event__expand-indicator {
  color: var(--ink);
  backdrop-filter: blur(4px);
  background: rgb(var(--sun-rgb) / 0.4);
}

@media (max-width: 720px) {
  .event__tags {
    justify-content: flex-start;
  }

  .avatar {
    width: 44px;
    height: 44px;
  }

  .event {
    padding: 12px;
  }

  .event__status {
    font-size: 10px;
    padding: 3px 8px;
  }
}
</style>

