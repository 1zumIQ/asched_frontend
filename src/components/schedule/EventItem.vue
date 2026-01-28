<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { ScheduleEvent, TagType, TagMeta, MemberTag, TypeTag, LiveStatus, LiveTypeMetadata } from '@/types/schedule'
import { memberTags, energyTags } from '@/data/schedule'
import { getLiveTypeMetadata } from '@/data/schedule'

const props = defineProps<{
  event: ScheduleEvent
  tagMeta: Record<TagType, TagMeta>
}>()

const isExpanded = ref(false)

// 类型元数据
const liveTypeMetadata = ref<LiveTypeMetadata[]>([])

// 加载类型元数据
onMounted(async () => {
  liveTypeMetadata.value = await getLiveTypeMetadata()
})

// 类型图标映射（从API获取）
const typeIconsMap = computed(() => {
  const map: Record<number, string> = {}
  liveTypeMetadata.value.forEach(meta => {
    map[meta.id] = meta.icon
  })
  return map
})

const avatarInitials = computed(() => {
  const words = props.event.title.split(' ')
  if (words.length >= 2 && words[0] && words[1] && words[0][0] && words[1][0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return props.event.title.slice(0, 2).toUpperCase()
})

// 获取主分类标签（第一个成员标签）
const primaryTag = computed<TagType>(() => {
  const found = props.event.tags.find((t) => memberTags.includes(t as MemberTag))
  if (found) return found
  if (props.event.tags[0]) return props.event.tags[0]
  return '思诺' as TagType
})

// 获取类型标签
const typeTag = computed(() => {
  return props.event.tags.find((t) => energyTags.includes(t as TypeTag))
})

// 使用后端提供的状态
const eventStatus = computed(() => {
  switch (props.event.status) {
    case 0: return 'ongoing' // 直播中
    case 1: return 'ended' // 已结束
    case 2: return 'interrupted' // 中断
    case 3: return 'upcoming' // 未开始
    case 4: return 'late' // 迟到
    default: return 'upcoming'
  }
})

const dotStatus = computed(() => {
  if (eventStatus.value === 'ongoing') return 'ongoing'
  if (eventStatus.value === 'ended') return 'ended'
  return 'upcoming'
})

// 获取状态标签
const statusLabel = computed(() => {
  switch (props.event.status) {
    case 0: return '直播中'
    case 1: return '已结束'
    case 2: return '中断'
    case 3: return '未开始'
    case 4: return '迟到'
    default: return ''
  }
})

// 获取状态颜色
const statusColor = computed(() => {
  switch (props.event.status) {
    case 0: return '#10b981' // 直播中 - 绿色
    case 1: return '#94a3b8' // 已结束 - 灰色
    case 2: return '#ef4444' // 中断 - 红色
    case 3: return '#6366f1' // 未开始 - 蓝色
    case 4: return '#f59e0b' // 迟到 - 橙色
    default: return '#6366f1'
  }
})

// 计算进度（如果正在进行中且有结束时间）
const progress = computed(() => {
  if (props.event.status !== 0 || !props.event.endTime) return 0

  const now = new Date()
  const startDate = new Date(props.event.startTime.replace(/(\d{2})-(\d{2})-(\d{2})/, '20$1-$2-$3'))
  const endDate = new Date(props.event.endTime.replace(/(\d{2})-(\d{2})-(\d{2})/, '20$1-$2-$3'))

  const duration = endDate.getTime() - startDate.getTime()
  const elapsed = now.getTime() - startDate.getTime()

  return Math.min(100, Math.max(0, (elapsed / duration) * 100))
})

// 持续时间显示
const durationText = computed(() => {
  if (props.event.endTime) {
    const startTime = props.event.startTime.split(' ')[1]
    const endTime = props.event.endTime.split(' ')[1]
    return `${startTime} - ${endTime}`
  }
  return `${props.event.time} (预计2小时)`
})
</script>

<template>
  <div class="event" :class="{
    'event--starting-soon': eventStatus === 'starting-soon',
    'event--ongoing': eventStatus === 'ongoing',
    'event--ended': eventStatus === 'ended',
    'event--expanded': isExpanded
  }" :style="{
      '--primary-color': tagMeta[primaryTag].color
    }" @click="isExpanded = !isExpanded">
    <!-- 进度条 -->
    <div v-if="eventStatus === 'ongoing'" class="event__progress-bar">
      <div class="event__progress-fill" :style="{
        width: `${progress}%`,
        backgroundColor: statusColor
      }"></div>
    </div>

    <div class="event__content">
      <div class="event__left">
        <div class="event__time-wrapper">
          <div class="event__time">{{ event.time }}</div>
          <!-- 状态指示器移到时间旁边 -->
          <div v-if="statusLabel" class="event__status" :style="{
            backgroundColor: statusColor,
            boxShadow: `0 0 8px ${statusColor}30`
          }">
            <span class="event__status-pulse" :style="{ backgroundColor: statusColor }"></span>
            {{ statusLabel }}
          </div>
          <div v-if="isExpanded" class="event__duration">{{ durationText }}</div>
        </div>
        <div class="event__body">
          <div class="event__title">
            <span
              class="dot"
              :class="`dot--${dotStatus}`"
              :style="{ backgroundColor: tagMeta[primaryTag].color, color: statusColor }"
            ></span>
            <div class="event__title-content">
              <div class="event__name">{{ event.title }}</div>
              <div class="event__meta">
                <span v-if="event.location">{{ event.location }}</span>
                <span v-if="event.note"> · {{ event.note }}</span>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div class="avatar" :style="{
        backgroundColor: tagMeta[primaryTag].tint,
        color: tagMeta[primaryTag].color,
        borderColor: tagMeta[primaryTag].color,
        backgroundImage: tagMeta[primaryTag].avatar ? `url(${tagMeta[primaryTag].avatar})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }">
        <span v-if="!tagMeta[primaryTag].avatar">{{ avatarInitials }}</span>
      </div>
    </div>

    <!-- 展开时显示嘉宾信息 -->
    <div v-if="isExpanded && event.guests && event.guests.length > 0" class="event__guests">
      <span class="event__guests-label">👥 嘉宾：</span>
      <span class="event__guests-list">{{ event.guests.join('、') }}</span>
    </div>

    <!-- 标签独立成行，占满整个宽度 -->
    <div class="event__tags">
      <span v-for="tag in event.tags" :key="tag" class="chip" :class="{ 'chip--type': energyTags.includes(tag as any) }"
        :style="{
          borderColor: tagMeta[tag].color,
          color: tagMeta[tag].color,
          backgroundColor: tagMeta[tag].tint,
        }">
        <span v-if="energyTags.includes(tag as any)" class="chip__icon">
          {{ typeIconsMap[event.liveType] || '📝' }}
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
  border-radius: 14px;
  border: 2px solid transparent;
  background:
    linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 2px 8px rgba(0, 0, 0, 0.04);
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
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--primary-color, #6366f1), transparent);
  opacity: 0;
  transition: opacity 250ms ease;
}

.event:hover {
  transform: translateX(4px) scale(1.02);
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.15);
}

.event:hover::before {
  opacity: 1;
}

.event:active {
  transform: translateX(2px) scale(1.01);
}

/* 状态样式 */
.event--starting-soon {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(145deg, #fffbeb 0%, #fef3c7 20%, #ffffff 60%);
}

.event--ongoing {
  border-color: rgba(16, 185, 129, 0.3);
  background: linear-gradient(145deg, #ecfdf5 0%, #d1fae5 20%, #ffffff 60%);
  animation: pulse-ongoing 2s ease-in-out infinite;
}

@keyframes pulse-ongoing {

  0%,
  100% {
    box-shadow:
      0 2px 8px rgba(16, 185, 129, 0.15),
      0 4px 16px rgba(16, 185, 129, 0.1);
  }

  50% {
    box-shadow:
      0 4px 12px rgba(16, 185, 129, 0.25),
      0 8px 24px rgba(16, 185, 129, 0.15);
  }
}

.event--ended {
  opacity: 0.7;
  filter: grayscale(0.3);
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
  color: white;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  animation: status-appear 300ms ease-out;
  flex-shrink: 0;
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
  height: 4px;
  background: rgba(0, 0, 0, 0.05);
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
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  border: 3px solid;
  flex-shrink: 0;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
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
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
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
  transform: scale(1.1) rotate(7.5deg);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.event__time-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.event__time {
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border: 1px solid #cbd5e1;
  transition: all 200ms ease;
  flex-shrink: 0;
}

.event__time::before {
  content: '🕐';
  font-size: 14px;
}

.event:hover .event__time {
  background: linear-gradient(135deg, #e0e7ff, #ddd6fe);
  border-color: #a5b4fc;
  color: #4f46e5;
  transform: translateX(2px);
}

.event__duration {
  color: #94a3b8;
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
  color: #0f172a;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  transition: color 200ms ease;
  letter-spacing: -0.01em;
}

.event:hover .event__name {
  color: var(--primary-color, #4f46e5);
}

.event__meta {
  color: #64748b;
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
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  animation: fade-in 300ms ease-out;
}

.event__guests-label {
  font-weight: 700;
  color: #475569;
  margin-right: 4px;
}

.event__guests-list {
  color: #64748b;
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
    0 0 0 3px rgba(255, 255, 255, 0.9),
    0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 200ms ease;
  position: relative;
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
    0 0 0 3px rgba(16, 185, 129, 0.18),
    0 4px 10px rgba(16, 185, 129, 0.25);
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
    0 0 0 2px rgba(148, 163, 184, 0.3),
    0 2px 6px rgba(148, 163, 184, 0.25);
}

.dot--ended::after {
  animation: none;
  opacity: 0;
}

.dot--upcoming {
  box-shadow:
    0 0 0 2px rgba(99, 102, 241, 0.2),
    0 2px 6px rgba(99, 102, 241, 0.2);
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
    0 0 0 4px rgba(255, 255, 255, 1),
    0 3px 8px rgba(0, 0, 0, 0.2);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  border: 2px solid;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
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
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 300ms ease;
}

.chip:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.chip:hover::before {
  left: 100%;
}

.chip__icon {
  font-size: 13px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
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
  color: #94a3b8;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0);

}

.event__expand-indicator svg {
  transition: transform 200ms ease;
}

.event:hover .event__expand-indicator {
  color: #6366f1;
  backdrop-filter: blur(4px);
  background: rgba(99, 102, 241, 0.1);
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
