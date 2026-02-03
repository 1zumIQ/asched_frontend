<script setup lang="ts">
import { computed } from 'vue'
import type { DayCard } from '@/types/ui'

const props = defineProps<{
  day: DayCard
  totalEvents: number
  variant?: 'card' | 'modal'
}>()

const headerClass = computed(() => (
  props.variant === 'modal' ? 'modal-header' : 'day-card__header'
))

const badgesClass = computed(() => (
  props.variant === 'modal' ? 'modal-badges' : 'day-card__badges'
))

const weekdayClass = computed(() => (
  props.variant === 'modal' ? 'modal-weekday' : 'day-card__weekday'
))

const dateClass = computed(() => (
  props.variant === 'modal' ? 'modal-date' : 'day-card__date'
))
</script>

<template>
  <header :class="[headerClass, { 'day-card-header--today': day.isToday }]">
    <div>
      <div :class="weekdayClass">{{ day.shortName }}</div>
      <div :class="dateClass">{{ day.numeric }}</div>
    </div>
    <div :class="badgesClass">
      <span v-if="day.isToday" class="pill pill--accent">Today</span>
      <span v-if="totalEvents > 0" class="pill pill--count">
        <span class="pill__icon">📅</span>
        {{ totalEvents }} 个活动
      </span>
    </div>
  </header>
</template>

<style scoped>
.day-card__header,
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px dashed var(--header-border, rgb(var(--ink-deep-rgb) / 0.25));
}

.day-card__header {
  margin-bottom: var(--header-gap, 16px);
  padding-bottom: var(--header-padding, 14px);
}

.modal-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  --header-border: rgb(var(--ink-deep-rgb) / 0.2);
}

.day-card__badges,
.modal-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.day-card__weekday,
.modal-weekday {
  color: var(--ink);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: var(--font-display);
}

.day-card__weekday {
  font-size: 14px;
}

.modal-weekday {
  font-size: 16px;
}

.day-card__date,
.modal-date {
  color: var(--ink);
  font-weight: 800;
  letter-spacing: 0.01em;
  font-family: var(--font-display);
  margin-top: 2px;
}

.day-card__date {
  font-size: 24px;
}

.modal-date {
  font-size: 30px;
  margin-top: 4px;
}

.day-card-header--today .day-card__weekday,
.day-card-header--today .modal-weekday {
  color: var(--sky);
  text-shadow: 2px 2px 0 rgb(var(--ink-deep-rgb) / 0.15);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 2px solid var(--outline);
  background: var(--surface-base);
  color: var(--ink);
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
  box-shadow: 2px 2px 0 var(--shadow);
  transition: all 200ms ease;
}

.pill:hover {
  transform: translate(-2px, -2px) rotate(-1deg);
  box-shadow: 4px 4px 0 var(--shadow-strong);
}

.pill__icon {
  font-size: 14px;
  filter: drop-shadow(0 1px 2px rgb(var(--ink-deep-rgb) / 0.1));
}

.pill--count {
  border-color: var(--outline);
  color: var(--ink);
  background: linear-gradient(135deg, var(--surface-cool), var(--surface-warm));
  font-weight: 800;
  box-shadow:
    3px 3px 0 var(--shadow-strong),
    inset 0 1px 0 var(--glass-60);
}

.pill--accent {
  border-color: var(--outline);
  color: var(--ink);
  background: linear-gradient(135deg, var(--surface-cool-soft), var(--surface-warm));
  font-weight: 800;
  box-shadow:
    3px 3px 0 var(--shadow-strong),
    inset 0 1px 0 var(--glass-60);
}

.day-card-header--today .pill--accent {
  animation: bounce-subtle 2.4s ease-in-out infinite;
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}
</style>
