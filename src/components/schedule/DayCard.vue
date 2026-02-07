<script setup lang="ts">
import { computed, shallowRef, type CSSProperties } from 'vue'
import type { DayCard, TagType, TagMeta, MemberTag, TypeTag } from '@/types/ui'
import type { LiveRecordView } from '@/domain/records'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import DayCardContent from './DayCardContent.vue'

const HAMBURGER_THRESHOLD = 3

const props = defineProps<{
  day: DayCard<LiveRecordView>
  tagMeta: Record<TagType, TagMeta>
  memberTags: MemberTag[]
  typeTags: TypeTag[]
  cardHeight?: number
}>()

const showModal = shallowRef(false)

useBodyScrollLock(showModal)

// 统计信息
const totalEvents = computed(() => props.day.events.length)
const hasEvents = computed(() => totalEvents.value > 0)
const isEmpty = computed(() => totalEvents.value === 0)

// 当一天有三场或以上直播时显示汉堡按钮
const showHamburgerButton = computed(() => (
  hasEvents.value && totalEvents.value >= HAMBURGER_THRESHOLD
))

// 计算卡片样式
const cardStyle = computed<CSSProperties>(() => {
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
}

const getStartHour = (event: LiveRecordView): number => {
  return event.startDate.getHours()
}

const morningEvents = computed(() =>
  props.day.events.filter((event) => getStartHour(event) < 12)
)

const afternoonEvents = computed(() =>
  props.day.events.filter((event) => getStartHour(event) >= 12)
)

// 按成员统计
const memberStats = computed<Array<[MemberTag, number]>>(() => {
  const stats = new Map<MemberTag, number>()
  props.day.events.forEach((event) => {
    event.memberTags.forEach((tag) => {
      if (!props.memberTags.includes(tag)) return
      stats.set(tag, (stats.get(tag) ?? 0) + 1)
    })
  })
  return [...stats.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3) // 只显示前3个
})

// 事件密度（用于视觉指示）
const eventDensity = computed(() => {
  if (isEmpty.value) return 'none'
  if (totalEvents.value <= 2) return 'light'
  if (totalEvents.value <= 4) return 'medium'
  return 'heavy'
})
</script>

<template>
  <article
    class="day-card"
    :class="{
      'day-card--today': day.isToday,
      [`day-card--${eventDensity}`]: true,
      'day-card--has-hamburger': showHamburgerButton
    }"
    :style="cardStyle"
  >
    <DayCardContent
      :day="day"
      :total-events="totalEvents"
      :member-stats="memberStats"
      :morning-events="morningEvents"
      :afternoon-events="afternoonEvents"
      :tag-meta="tagMeta"
      :type-tags="typeTags"
      stats-collapsible
      divider-collapsible
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

          <DayCardContent
            :day="day"
            :total-events="totalEvents"
            :member-stats="memberStats"
            :morning-events="morningEvents"
            :afternoon-events="afternoonEvents"
            :tag-meta="tagMeta"
            :type-tags="typeTags"
            variant="modal"
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
  --section-gap: 8px;
  --section-body-gap: 12px;
  --section-body-padding: 12px 8px;
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
    transform 400ms var(--ease-out-back),
    box-shadow 400ms var(--ease-out-back),
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
  background: linear-gradient(
    90deg,
    var(--schedule-accent-hot),
    var(--schedule-accent-warm),
    var(--schedule-accent-mint)
  );
  opacity: 0.85;
  box-shadow: 0 2px 0 var(--shadow-strong);
}

.day-card:hover {
  transform: translateY(-8px) scale(1.02) rotate(-1deg);
  box-shadow:
    8px 8px 0 var(--shadow-strong),
    0 24px 40px var(--shadow-ambient-2);
  z-index: 2;
}

.day-card:active {
  transform: scale(0.98);
  transition: transform 100ms var(--ease-squish);
}

.day-card--today {
  border-color: var(--schedule-accent-cool);
  --card-dot-color: rgb(var(--schedule-accent-cool-rgb) / 0.12);
  --card-surface: linear-gradient(
    145deg,
    var(--surface-cool-soft) 0%,
    var(--surface-base) 55%,
    var(--surface-sunlight) 100%
  );
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 22px 34px rgb(var(--schedule-accent-cool-rgb) / 0.22);
  animation: none;
}

.day-card--today::before {
  background: linear-gradient(
    90deg,
    var(--schedule-accent-cool),
    var(--schedule-accent-mint),
    var(--schedule-accent-warm)
  );
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
  background: var(--schedule-accent-warm);
}

.day-card--heavy::after {
  background: var(--schedule-accent-hot);
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

.hamburger-button {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--outline);
  background: linear-gradient(135deg, var(--schedule-accent-warm) 0%, var(--surface-warm) 100%);
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
  background: linear-gradient(
    135deg,
    var(--schedule-accent-hot) 0%,
    var(--schedule-accent-berry) 100%
  );
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
  background: linear-gradient(
    135deg,
    var(--schedule-accent-hot) 0%,
    var(--schedule-accent-berry) 100%
  );
  color: var(--text-on-accent);
  border-color: var(--outline);
  transform: translate(-1px, -1px) scale(1.05) rotate(8deg);
  box-shadow: 4px 4px 0 var(--shadow-strong);
}

/* ========== SHADCN/UI MINIMALIST DARK OVERRIDES ========== */
:root[data-theme='dark'] .day-card {
  --card-surface: var(--surface-warm);
  border-color: var(--outline);
  box-shadow: var(--shadow);
}

:root[data-theme='dark'] .day-card::before {
  /* Subtle clean accent line */
  background: linear-gradient(
    90deg,
    var(--schedule-accent-hot),
    var(--schedule-accent-cool)
  );
  opacity: 0.8;
  box-shadow: none;
}

:root[data-theme='dark'] .day-card:hover {
  transform: translateY(-2px);
  border-color: var(--ink-soft);
  box-shadow: var(--shadow-strong);
}

:root[data-theme='dark'] .day-card--today {
  border-color: var(--schedule-accent-cool);
  --card-surface: var(--surface-warm-strong);
  box-shadow: 0 0 0 1px var(--schedule-accent-cool), var(--shadow-strong);
}

:root[data-theme='dark'] .day-card--heavy::after {
  background: var(--schedule-accent-hot);
  box-shadow: none;
  border-color: var(--surface-base);
  animation: none;
}

:root[data-theme='dark'] .hamburger-button {
  background: var(--surface-warm-strong);
  border-color: var(--outline);
  color: var(--ink);
}

:root[data-theme='dark'] .hamburger-button:hover {
  background: var(--surface-warm-deep);
  border-color: var(--ink-soft);
  color: var(--ink);
  transform: translate(-50%, -2px);
}

:root[data-theme='dark'] .modal-overlay {
  background: rgb(0 0 0 / 0.8);
  backdrop-filter: blur(4px);
}

:root[data-theme='dark'] .modal-content {
  box-shadow: var(--shadow-strong), 0 0 0 1px var(--outline);
  animation: modal-slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

:root[data-theme='dark'] .modal-close {
  border-color: var(--outline);
  background: var(--surface-warm-strong);
}

:root[data-theme='dark'] .modal-close:hover {
  background: var(--surface-warm-deep);
  border-color: var(--ink-soft);
  color: var(--ink);
  transform: scale(1.05);
}
</style>
