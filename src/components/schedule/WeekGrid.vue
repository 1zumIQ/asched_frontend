<script setup lang="ts">
import type { DayCard, TagType, TagMeta } from '@/types/schedule'
import DayCardComponent from './DayCard.vue'

defineProps<{
  dayCards: DayCard[]
  tagMeta: Record<TagType, TagMeta>
}>()
</script>

<template>
  <section class="grid">
    <DayCardComponent
      v-for="day in dayCards"
      :key="day.longName"
      :day="day"
      :tag-meta="tagMeta"
    />
  </section>
</template>

<style scoped>
.grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(7, minmax(180px, 1fr));
  gap: 12px;
  overflow: auto;
  flex: 1;
  padding: 8px 4px 4px;
  margin-left: -4px;
  margin-right: -4px;
}

.grid::-webkit-scrollbar {
  height: 6px;
}

.grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 999px;
}
</style>
