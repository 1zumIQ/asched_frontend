<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import type { DayCard, TagType, TagMeta, MemberTag, TypeTag } from '@/types/ui'
import type { LiveRecordView } from '@/domain/records'
import DayCardHeader from './DayCardHeader.vue'
import DayCardStats from './DayCardStats.vue'
import DayCardSections from './DayCardSections.vue'

const props = defineProps<{
  day: DayCard<LiveRecordView>
  tagMeta: Record<TagType, TagMeta>
  memberTags: MemberTag[]
  typeTags: TypeTag[]
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
  document.body.style.overflow = showModal.value ? 'hidden' : ''
}

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

const getStartHour = (event: LiveRecordView): number => {
  return event.startDate.getHours()
}

const morningEvents = computed(() =>
  props.day.events.filter((event) => getStartHour(event) < 12)
)

const afternoonEvents = computed(() =>
  props.day.events.filter((event) => getStartHour(event) >= 12)
)

// 统计信息
const totalEvents = computed(() => props.day.events.length)

// 按成员统计
const memberStats = computed(() => {
  const stats: Record<string, number> = {}
  props.day.events.forEach((event) => {
    event.memberTags.forEach((tag) => {
      if (props.memberTags.includes(tag as MemberTag)) {
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
  <article
    ref="cardRef"
    class="day-card"
    :class="{
      'day-card--today': day.isToday,
      [`day-card--${eventDensity}`]: true,
      'day-card--has-hamburger': showHamburgerButton
    }"
    :style="cardStyle"
  >
    <DayCardHeader :day="day" :total-events="totalEvents" variant="card" />

    <DayCardStats
      v-if="memberStats.length > 0"
      :stats="memberStats"
      :tag-meta="tagMeta"
      variant="card"
      collapsible
    />

    <div v-if="day.events.length === 0" class="empty">
      暂无安排 睡大觉喽！
    </div>
    <DayCardSections
      v-else
      :morning-events="morningEvents"
      :afternoon-events="afternoonEvents"
      :tag-meta="tagMeta"
      :type-tags="typeTags"
      collapsible-divider
    />

    <button
      v-if="showHamburgerButton"
      class="hamburger-button"
      @click="toggleModal"
      aria-label="查看完整日程"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="toggleModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="toggleModal" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <DayCardHeader :day="day" :total-events="totalEvents" variant="modal" />

          <DayCardStats
            v-if="memberStats.length > 0"
            :stats="memberStats"
            :tag-meta="tagMeta"
            variant="modal"
          />

          <div v-if="day.events.length === 0" class="empty">
            暂无安排 睡大觉喽！
          </div>
          <DayCardSections
            v-else
            variant="modal"
            :morning-events="morningEvents"
            :afternoon-events="afternoonEvents"
            :tag-meta="tagMeta"
            :type-tags="typeTags"
          />
        </div>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
.day-card,
.modal-content {
  --card-padding: 12px;
  --card-dot-size: 24px;
  --card-dot-color: rgb(var(--ink-deep-rgb) / 0.06);
  --card-surface: linear-gradient(145deg, var(--surface-base) 0%, var(--surface-warm) 100%);
  --card-shadow: var(--shadow-ambient-1);
  --header-gap: 16px;
  --header-padding: 14px;
  --stats-padding: 12px;
  --stats-margin-bottom: 16px;
  --section-padding: 10px;
  --section-gap: 12px;
  --section-body-gap: 12px;
  --section-body-padding: 8px;
  --section-empty-padding: 6px 10px;
  --section-empty-gap: 4px;
  --section-empty-label-padding: 2px 8px;
  --section-empty-label-font: 11px;
  --section-empty-icon-size: 14px;
  --section-empty-text-padding: 4px 8px;
  --section-empty-text-font: 11px;
  --stack-gap: 12px;
  --sections-gap: 14px;
  --divider-gap: 10px;
  --divider-padding: 6px 0;
  --morning-body-max: clamp(120px, 22vh, 220px);
  --density-dot-size: 8px;
  --density-dot-offset: 12px;
}

@media (max-height: 800px) {
  .day-card,
  .modal-content {
    --section-padding: 8px;
    --section-gap: 8px;
    --section-body-gap: 10px;
    --stack-gap: 8px;
  }
}

@media (max-height: 700px) {
  .day-card,
  .modal-content {
    --section-padding: 6px;
    --section-gap: 6px;
    --section-body-gap: 8px;
    --stack-gap: 6px;
  }
}

.day-card {
  padding: var(--card-padding);
  border-radius: var(--radius-xl);
  border: 2px solid var(--outline);
  background:
    radial-gradient(circle at 12px 12px, var(--card-dot-color) 1px, transparent 1px),
    var(--card-surface);
  background-size: var(--card-dot-size) var(--card-dot-size), cover;
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    0 16px 26px var(--card-shadow);
  transition:
    transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 200ms ease;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.day-card * {
  box-sizing: border-box;
}

.day-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(90deg, var(--coral), var(--sun), var(--mint));
  opacity: 0.85;
  box-shadow: 0 2px 0 var(--shadow-strong);
}

.day-card:hover {
  transform: translate(-4px, -4px) rotate(-0.4deg);
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 20px 36px var(--shadow-ambient-2);
}

.day-card--today {
  border-color: var(--sky);
  --card-dot-color: rgb(var(--sky-rgb) / 0.12);
  --card-surface: linear-gradient(
    145deg,
    var(--surface-cool-soft) 0%,
    var(--surface-base) 55%,
    var(--surface-sunlight) 100%
  );
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 22px 34px rgb(var(--sky-rgb) / 0.22);
  animation: none;
}

.day-card--today::before {
  background: linear-gradient(90deg, var(--sky), var(--mint), var(--sun));
}

.day-card--medium::after,
.day-card--heavy::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: var(--density-dot-size);
  height: var(--density-dot-size);
  border-radius: 50%;
  margin: var(--density-dot-offset);
  border: 2px solid var(--outline);
  box-shadow: 2px 2px 0 var(--shadow);
}

.day-card--medium::after {
  background: var(--sun);
}

.day-card--heavy::after {
  background: var(--coral);
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

.empty {
  padding: 24px 16px;
  border-radius: var(--radius-md);
  border: 2px dashed rgb(var(--ink-deep-rgb) / 0.25);
  color: var(--ink-soft);
  background: linear-gradient(135deg, var(--surface-base) 0%, var(--surface-warm-soft) 100%);
  font-size: 14px;
  text-align: center;
  font-weight: 600;
  transition: all 200ms ease;
}

.empty:hover {
  border-color: var(--outline);
  color: var(--ink);
  background: linear-gradient(135deg, var(--surface-base), var(--surface-rose));
}

.hamburger-button {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--outline);
  background: linear-gradient(135deg, var(--sun) 0%, var(--surface-warm) 100%);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    3px 3px 0 var(--shadow-strong),
    0 12px 18px rgb(var(--ink-deep-rgb) / 0.18);
  z-index: 5;
}

.hamburger-button:hover {
  background: linear-gradient(135deg, var(--coral) 0%, var(--berry) 100%);
  color: var(--text-on-accent);
  border-color: var(--outline);
  transform: translate(-50%, -2px) scale(1.08);
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    0 16px 24px rgb(var(--ink-deep-rgb) / 0.22);
}

.hamburger-button:active {
  transform: translateX(-50%) scale(1.05);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
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
  background: var(--card-surface);
  border-radius: var(--radius-xl);
  border: 2px solid var(--outline);
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 24px 42px var(--shadow-ambient-4);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--outline-rgb) / 0.6) var(--glass-60);
  padding: 24px;
  position: relative;
  animation: modal-slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content::-webkit-scrollbar {
  width: 10px;
}

.modal-content::-webkit-scrollbar-track {
  background: var(--glass-65);
  border-radius: 999px;
  border: 1px dashed rgb(var(--outline-rgb) / 0.2);
}

.modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--surface-rose-soft), var(--surface-sun));
  border-radius: 999px;
  border: 2px solid var(--glass-80);
  box-shadow: inset 0 0 0 1px rgb(var(--outline-rgb) / 0.35);
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--surface-rose), var(--surface-sun-strong));
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
  border: 2px solid var(--outline);
  background: var(--surface-base);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 200ms ease;
  z-index: 10;
  box-shadow: 2px 2px 0 var(--shadow);
}

.modal-close:hover {
  background: linear-gradient(135deg, var(--coral) 0%, var(--berry) 100%);
  color: var(--text-on-accent);
  border-color: var(--outline);
  transform: translate(-1px, -1px) scale(1.05) rotate(8deg);
  box-shadow: 4px 4px 0 var(--shadow-strong);
}
</style>
