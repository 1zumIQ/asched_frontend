<script setup lang="ts">
import { computed } from 'vue'
import type { DayCard, TagType } from '@/types/schedule'
import { tagMeta, weeklyPlan } from '@/data/schedule'
import { ScheduleHero, ScheduleLegend, WeekGrid } from '@/components/schedule'

const now = new Date()

const startOfWeek = computed(() => {
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() + mondayOffset)
  return monday
})

const endOfWeek = computed(() => {
  const end = new Date(startOfWeek.value)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
})

const weekRangeLabel = computed(() => {
  const start = startOfWeek.value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = endOfWeek.value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${start} - ${end}`
})

const dayCards = computed<DayCard[]>(() => {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek.value)
    date.setDate(startOfWeek.value.getDate() + index)
    const longName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const shortName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const numeric = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const isToday = date.toDateString() === now.toDateString()
    const events = weeklyPlan[longName] ?? []
    return { longName, shortName, numeric, isToday, events }
  })
})

const totalSessions = computed(() =>
  Object.values(weeklyPlan).reduce((sum, items) => sum + items.length, 0)
)

const tagCounts = computed(() => {
  const counts = {} as Record<TagType, number>
  Object.values(weeklyPlan).forEach((events) => {
    events.forEach((event) => {
      event.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    })
  })
  return counts
})
</script>

<template>
  <main class="page">
    <ScheduleHero
      :week-range-label="weekRangeLabel"
      :total-sessions="totalSessions"
      :tag-meta="tagMeta"
      :tag-counts="tagCounts"
    />
    <!-- <ScheduleLegend :tag-meta="tagMeta" /> -->
    <WeekGrid :day-cards="dayCards" :tag-meta="tagMeta" />
  </main>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

html {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

body {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #faf5ff 100%);
  color: #1e293b;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  height: 100vh;
  overflow: hidden;
}
</style>

<style scoped>
.page {
  height: 100vh;
  padding: 20px clamp(16px, 3vw, 32px);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
