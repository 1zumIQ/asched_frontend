<script setup lang="ts">
import { computed } from 'vue'
import type { DayCard, TagType, TagMeta, ScheduleEvent } from '@/types/schedule'
import EventItem from './EventItem.vue'

const props = defineProps<{
  day: DayCard
  tagMeta: Record<TagType, TagMeta>
}>()

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
</script>

<template>
  <article class="day-card" :class="{ 'day-card--today': day.isToday }">
    <header class="day-card__header">
      <div>
        <div class="day-card__weekday">{{ day.shortName }}</div>
        <div class="day-card__date">{{ day.numeric }}</div>
      </div>
      <span v-if="day.isToday" class="pill pill--accent">Today</span>
    </header>

    <div v-if="day.events.length === 0" class="empty">
      Unscheduled — hold for recovery or planning.
    </div>
    <div v-else class="sections">
      <!-- 上午 -->
      <div class="section section--morning">
        <div class="section__header">
          <div class="section__line"></div>
          <div class="section__label">
            <span class="section__icon">☀️</span>
            <span>上午</span>
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
      <div class="section section--afternoon">
        <div class="section__header">
          <div class="section__line"></div>
          <div class="section__label">
            <span class="section__icon">🌆</span>
            <span>下午</span>
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
  </article>
</template>

<style scoped>
.day-card {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;
}

.day-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #c7d2fe;
}

.day-card--today {
  border-color: #10b981;
  border-width: 2px;
  background: linear-gradient(160deg, #ecfdf5 0%, #d1fae5 30%, #ffffff 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2), 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.day-card--today .day-card__weekday {
  color: #059669;
}

.day-card--today .pill--accent {
  border-color: #6ee7b7;
  color: #047857;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.day-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.day-card__weekday {
  color: #6366f1;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.02em;
}

.day-card__date {
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
}

.empty {
  padding: 14px;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  color: #94a3b8;
  background: #f8fafc;
  font-size: 13px;
  text-align: center;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
}

.section--morning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
}

.section--afternoon {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 1px solid #c7d2fe;
}

.section__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section__line {
  flex: 1;
  height: 1px;
  background: currentColor;
  opacity: 0.3;
}

.section--morning .section__line {
  background: #f59e0b;
}

.section--afternoon .section__line {
  background: #6366f1;
}

.section__label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.section--morning .section__label {
  color: #d97706;
}

.section--afternoon .section__label {
  color: #4f46e5;
}

.section__icon {
  font-size: 14px;
}

.section__empty {
  color: #9ca3af;
  font-size: 12px;
  text-align: center;
  padding: 8px;
  font-style: italic;
}

.divider {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.divider__line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e11d48, transparent);
  border-radius: 2px;
}

.divider__badge {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #e11d48, #be123c);
  padding: 3px 8px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(225, 29, 72, 0.3);
  white-space: nowrap;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
}

.pill--accent {
  border-color: #a5b4fc;
  color: #4f46e5;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  font-weight: 600;
}
</style>
