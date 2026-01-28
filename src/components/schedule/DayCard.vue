<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DayCard, TagType, TagMeta, ScheduleEvent, MemberTag } from '@/types/schedule'
import EventItem from './EventItem.vue'
import { memberTags } from '@/data/schedule'

const props = defineProps<{
  day: DayCard
  tagMeta: Record<TagType, TagMeta>
  cardHeight?: number
}>()

const cardRef = ref<HTMLElement | null>(null)
const showModal = ref(false)

// 当一天有三场或以上直播时显示汉堡按钮
const showHamburgerButton = computed(() => props.day.events.length >= 3)

// 计算卡片样式
const cardStyle = computed(() => {
  if (props.cardHeight && props.cardHeight > 0) {
    return {
      height: `${props.cardHeight}px`,
      minHeight: `${props.cardHeight}px`,
      maxHeight: `${props.cardHeight}px`
    }
  }
  return {}
})

// 打开/关闭模态框
const toggleModal = () => {
  showModal.value = !showModal.value
  // 阻止body滚动
  if (showModal.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const getStartHour = (event: ScheduleEvent): number => {
  const match = event.time.match(/^(\d{1,2}):/)
  return match && match[1] ? parseInt(match[1], 10) : 0
}

const morningEvents = computed(() =>
  props.day.events.filter((e) => getStartHour(e) < 12)
)

const afternoonEvents = computed(() =>
  props.day.events.filter((e) => getStartHour(e) >= 12)
)

// 统计信息
const totalEvents = computed(() => props.day.events.length)

// 按成员统计
const memberStats = computed(() => {
  const stats: Record<string, number> = {}
  props.day.events.forEach(event => {
    event.tags.forEach(tag => {
      if (memberTags.includes(tag as MemberTag)) {
        stats[tag] = (stats[tag] || 0) + 1
      }
    })
  })
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3) // 只显示前3个
})

// 事件密度（用于视觉指示）
const eventDensity = computed(() => {
  if (totalEvents.value === 0) return 'none'
  if (totalEvents.value <= 2) return 'light'
  if (totalEvents.value <= 4) return 'medium'
  return 'heavy'
})
</script>

<template>
  <article ref="cardRef" class="day-card" :class="{ 'day-card--today': day.isToday, [`day-card--${eventDensity}`]: true, 'day-card--has-hamburger': showHamburgerButton }" :style="cardStyle">
    <header class="day-card__header">
      <div>
        <div class="day-card__weekday">{{ day.shortName }}</div>
        <div class="day-card__date">{{ day.numeric }}</div>
      </div>
      <div class="day-card__badges">
        <span v-if="day.isToday" class="pill pill--accent">Today</span>
        <span v-if="totalEvents > 0" class="pill pill--count">
          <span class="pill__icon">📅</span>
          {{ totalEvents }} 个活动
        </span>
      </div>
    </header>

    <!-- 统计信息 - 在高度受限时隐藏 -->
    <div v-if="memberStats.length > 0" class="day-card__stats day-card__stats--collapsible">
      <div class="stats-label">今日成员</div>
      <div class="stats-members">
        <div
          v-for="[member, count] in memberStats"
          :key="member"
          class="stats-member"
          :style="{
            backgroundColor: tagMeta[member as TagType].tint,
            borderColor: tagMeta[member as TagType].color,
            color: tagMeta[member as TagType].color
          }"
        >
          <span class="stats-member__name">{{ tagMeta[member as TagType].label }}</span>
          <span class="stats-member__count">×{{ count }}</span>
        </div>
      </div>
    </div>

    <div v-if="day.events.length === 0" class="empty">
      暂无安排 睡大觉喽！
    </div>
    <div v-else class="sections">
      <!-- 上午 -->
      <div class="section section--morning" :class="{ 'section--empty': morningEvents.length === 0 }">
        <div class="section__header">
          <div class="section__line"></div>
          <div class="section__label">
            <span class="section__icon">☀️</span>
            <span>上午</span>
            <span v-if="morningEvents.length > 0" class="section__count">{{ morningEvents.length }}</span>
          </div>
          <div class="section__line"></div>
        </div>
        <div v-if="morningEvents.length > 0" class="stack">
          <EventItem
            v-for="event in morningEvents"
            :key="event.title"
            :event="event"
            :tag-meta="tagMeta"
          />
        </div>
        <div v-else class="section__empty">暂无安排</div>
      </div>

      <!-- 分界线 - 在高度受限时隐藏 -->
      <div class="divider divider--collapsible">
        <div class="divider__line"></div>
        <div class="divider__badge">12:00</div>
        <div class="divider__line"></div>
      </div>

      <!-- 下午 -->
      <div class="section section--afternoon" :class="{ 'section--empty': afternoonEvents.length === 0 }">
        <div class="section__header">
          <div class="section__line"></div>
          <div class="section__label">
            <span class="section__icon">🌆</span>
            <span>下午</span>
            <span v-if="afternoonEvents.length > 0" class="section__count">{{ afternoonEvents.length }}</span>
          </div>
          <div class="section__line"></div>
        </div>
        <div v-if="afternoonEvents.length > 0" class="stack">
          <EventItem
            v-for="event in afternoonEvents"
            :key="event.title"
            :event="event"
            :tag-meta="tagMeta"
          />
        </div>
        <div v-else class="section__empty">暂无安排</div>
      </div>
    </div>

    <!-- Hamburger按钮 - 当一天有三场或以上直播时显示 -->
    <button v-if="showHamburgerButton" class="hamburger-button" @click="toggleModal" aria-label="查看完整日程">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- 模态框 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="toggleModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="toggleModal" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <header class="modal-header">
            <div>
              <div class="modal-weekday">{{ day.shortName }}</div>
              <div class="modal-date">{{ day.numeric }}</div>
            </div>
            <div class="modal-badges">
              <span v-if="day.isToday" class="pill pill--accent">Today</span>
              <span v-if="totalEvents > 0" class="pill pill--count">
                <span class="pill__icon">📅</span>
                {{ totalEvents }} 个活动
              </span>
            </div>
          </header>

          <!-- 统计信息 -->
          <div v-if="memberStats.length > 0" class="modal-stats">
            <div class="stats-label">今日成员</div>
            <div class="stats-members">
              <div
                v-for="[member, count] in memberStats"
                :key="member"
                class="stats-member"
                :style="{
                  backgroundColor: tagMeta[member as TagType].tint,
                  borderColor: tagMeta[member as TagType].color,
                  color: tagMeta[member as TagType].color
                }"
              >
                <span class="stats-member__name">{{ tagMeta[member as TagType].label }}</span>
                <span class="stats-member__count">×{{ count }}</span>
              </div>
            </div>
          </div>

          <div v-if="day.events.length === 0" class="empty">
            暂无安排 睡大觉喽！
          </div>
          <div v-else class="modal-sections">
            <!-- 上午 -->
            <div class="section section--morning" :class="{ 'section--empty': morningEvents.length === 0 }">
              <div class="section__header">
                <div class="section__line"></div>
                <div class="section__label">
                  <span class="section__icon">☀️</span>
                  <span>上午</span>
                  <span v-if="morningEvents.length > 0" class="section__count">{{ morningEvents.length }}</span>
                </div>
                <div class="section__line"></div>
              </div>
              <div v-if="morningEvents.length > 0" class="stack">
                <EventItem
                  v-for="event in morningEvents"
                  :key="event.title"
                  :event="event"
                  :tag-meta="tagMeta"
                />
              </div>
              <div v-else class="section__empty">暂无安排</div>
            </div>

            <!-- 分界线 -->
            <div class="divider">
              <div class="divider__line"></div>
              <div class="divider__badge">12:00</div>
              <div class="divider__line"></div>
            </div>

            <!-- 下午 -->
            <div class="section section--afternoon" :class="{ 'section--empty': afternoonEvents.length === 0 }">
              <div class="section__header">
                <div class="section__line"></div>
                <div class="section__label">
                  <span class="section__icon">🌆</span>
                  <span>下午</span>
                  <span v-if="afternoonEvents.length > 0" class="section__count">{{ afternoonEvents.length }}</span>
                </div>
                <div class="section__line"></div>
              </div>
              <div v-if="afternoonEvents.length > 0" class="stack">
                <EventItem
                  v-for="event in afternoonEvents"
                  :key="event.title"
                  :event="event"
                  :tag-meta="tagMeta"
                />
              </div>
              <div v-else class="section__empty">暂无安排</div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
.day-card {
  padding: 18px;
  border-radius: 20px;
  border: 2px solid transparent;
  background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  transition:
    transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 200ms ease;
  position: relative;
  /* 高度由 Vue 动态计算并通过 style 绑定设置 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.day-card * {
  box-sizing: border-box;
}

/* 有汉堡按钮时的样式 */
.day-card--has-hamburger {
  /* 不再使用 padding-bottom，改为让 sections 留出空间 */
}

.day-card--has-hamburger .sections {
  /* 不为汉堡按钮预留空间，保持内容完整 */
}

.day-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
  opacity: 0;
  transition: opacity 200ms ease;
}

.day-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 8px 24px rgba(99, 102, 241, 0.12),
    0 16px 48px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
}

.day-card:hover::before {
  opacity: 1;
}

.day-card--today {
  border-color: #06b6d4;
  background:
    linear-gradient(145deg, #ecfeff 0%, #cffafe 20%, #ffffff 60%, #fafbfc 100%);
  box-shadow:
    0 4px 16px rgba(6, 182, 212, 0.18),
    0 8px 32px rgba(6, 182, 212, 0.12),
    0 0 0 1px rgba(6, 182, 212, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  animation: pulse-today 3s ease-in-out infinite;
}

@keyframes pulse-today {
  0%, 100% {
    box-shadow:
      0 4px 16px rgba(6, 182, 212, 0.16),
      0 8px 32px rgba(6, 182, 212, 0.12),
      0 0 0 1px rgba(6, 182, 212, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }
  50% {
    box-shadow:
      0 4px 20px rgba(6, 182, 212, 0.28),
      0 8px 40px rgba(6, 182, 212, 0.18),
      0 0 0 2px rgba(6, 182, 212, 0.32),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
}

.day-card--today::before {
  background: linear-gradient(90deg, #06b6d4, #22d3ee, #0ea5e9);
  opacity: 1;
}

.day-card--today .day-card__weekday {
  color: #0e7490;
  text-shadow: 0 1px 2px rgba(14, 116, 144, 0.18);
}

.day-card--today .pill--accent {
  border-color: #67e8f9;
  color: #0e7490;
  background: linear-gradient(135deg, #ecfeff, #cffafe);
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.25);
  animation: bounce-subtle 2s ease-in-out infinite;
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

.day-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 2px solid transparent;
  background: linear-gradient(90deg, #f1f5f9 0%, transparent 100%) bottom / 100% 2px no-repeat;
}

.day-card__badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 统计信息 */
.day-card__stats {
  margin-bottom: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  animation: stats-appear 400ms ease-out;
}

/* 高度受限时隐藏统计信息 */
@media (max-height: 900px) {
  .day-card__stats--collapsible {
    display: none;
  }
}

@keyframes stats-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 8px;
}

.stats-members {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stats-member {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 2px solid;
  font-size: 12px;
  font-weight: 700;
  transition: all 200ms ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.stats-member:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stats-member__name {
  letter-spacing: -0.01em;
}

.stats-member__count {
  font-size: 11px;
  opacity: 0.8;
  font-weight: 800;
}

/* 事件密度指示 */
.day-card--light {
  /* 轻度 */
}

.day-card--medium::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  margin: 12px;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

.day-card--heavy::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  margin: 12px;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  animation: pulse-heavy 2s ease-in-out infinite;
}

@keyframes pulse-heavy {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.day-card__weekday {
  color: #6366f1;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.day-card__date {
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-top: 2px;
}

.empty {
  padding: 24px 16px;
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
  color: #94a3b8;
  background:
    linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-size: 14px;
  text-align: center;
  font-weight: 500;
  transition: all 200ms ease;
}

.empty:hover {
  border-color: #a5b4fc;
  color: #6366f1;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-height: 0; /* 关键：允许flex子元素缩小 */
  overflow: hidden;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sections::-webkit-scrollbar {
  display: none;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: all 200ms ease;
}

/* 空section样式 - 更紧凑 */
.section--empty {
  padding: 6px 10px;
  gap: 4px;
  min-height: auto;
}

.section--empty .section__header {
  margin-bottom: 0;
}

.section--empty .section__label {
  padding: 2px 8px;
  font-size: 11px;
}

.section--empty .section__icon {
  font-size: 14px;
}

.section--empty .section__empty {
  padding: 4px 8px;
  font-size: 11px;
}

/* 高度受限时减少内边距 */
@media (max-height: 800px) {
  .section {
    padding: 10px;
    gap: 8px;
  }
}

@media (max-height: 700px) {
  .section {
    padding: 8px;
    gap: 6px;
  }
}

.section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.6;
  pointer-events: none;
}

.section--morning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fef9c3 100%);
  border: 2px solid #fde68a;
  box-shadow:
    0 2px 8px rgba(245, 158, 11, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  flex: 0 0 auto;
  overflow: visible;
}

.section--morning:hover {
  box-shadow:
    0 4px 16px rgba(245, 158, 11, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  border-color: #fbbf24;
}

.section--afternoon {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #ddd6fe 100%);
  border: 2px solid #c7d2fe;
  box-shadow:
    0 2px 8px rgba(99, 102, 241, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  flex: 1 1 auto;
  min-height: 0;
}

.section--afternoon:hover {
  box-shadow:
    0 4px 16px rgba(99, 102, 241, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  border-color: #a5b4fc;
}

.section__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.section__line {
  flex: 1;
  height: 2px;
  background: currentColor;
  opacity: 0.25;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.section__line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.section--morning .section__line {
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
}

.section--afternoon .section__line {
  background: linear-gradient(90deg, transparent, #6366f1, transparent);
}

.section__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  padding: 4px 10px;
  border-radius: 8px;
  transition: all 200ms ease;
}

.section__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  margin-left: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section--morning .section__label {
  color: #d97706;
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.section--afternoon .section__label {
  color: #4f46e5;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.section__icon {
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.section__empty {
  color: #9ca3af;
  font-size: 13px;
  text-align: center;
  padding: 12px;
  font-style: italic;
  font-weight: 500;
  opacity: 0.7;
}

/* 高度受限时隐藏空状态提示 */
@media (max-height: 700px) {
  .section__empty {
    display: none;
  }
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  margin: 2px 0;
}

/* 高度受限时隐藏分界线 */
@media (max-height: 800px) {
  .divider--collapsible {
    display: none;
  }
}

.divider__line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e11d48 20%, #e11d48 80%, transparent);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.divider__line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: slide 4s infinite;
}

@keyframes slide {
  0% {
    left: -100%;
  }
  100% {
    left: 150%;
  }
}

.divider__badge {
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #f43f5e, #e11d48, #be123c);
  padding: 5px 12px;
  border-radius: 999px;
  box-shadow:
    0 2px 8px rgba(225, 29, 72, 0.3),
    0 4px 16px rgba(225, 29, 72, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
}

.divider__badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 高度受限时减少间距 */
@media (max-height: 800px) {
  .stack {
    gap: 8px;
  }
}

@media (max-height: 700px) {
  .stack {
    gap: 6px;
  }
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 200ms ease;
}

.pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pill__icon {
  font-size: 14px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.pill--count {
  border-color: #c7d2fe;
  color: #4f46e5;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  font-weight: 700;
  box-shadow:
    0 2px 8px rgba(99, 102, 241, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.pill--accent {
  border-color: #a5b4fc;
  color: #4f46e5;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff, #ddd6fe);
  font-weight: 700;
  box-shadow:
    0 2px 8px rgba(99, 102, 241, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

/* Hamburger按钮 */
.hamburger-button {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.08);
  z-index: 5;
}

.hamburger-button:hover {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-color: #6366f1;
  transform: translateX(-50%) scale(1.1);
  box-shadow:
    0 6px 16px rgba(99, 102, 241, 0.3),
    0 4px 8px rgba(99, 102, 241, 0.2);
}

.hamburger-button:active {
  transform: translateX(-50%) scale(1.05);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: modal-fade-in 200ms ease-out;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 24px;
  border: 2px solid #e2e8f0;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 8px 24px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;
  animation: modal-slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 200ms ease;
  z-index: 10;
}

.modal-close:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-color: #ef4444;
  transform: scale(1.1) rotate(90deg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.modal-weekday {
  color: #6366f1;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-date {
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-top: 4px;
}

.modal-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-stats {
  margin-bottom: 20px;
  padding: 14px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.modal-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
