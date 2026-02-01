<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  colors: string[]
  title?: string
}>()

const limitedColors = computed(() => props.colors.slice(0, 4))
const colorCount = computed(() => limitedColors.value.length)

const layoutClass = computed(() => {
  if (colorCount.value <= 1) return 'week-day-swatch--single'
  if (colorCount.value === 2) return 'week-day-swatch--split-2'
  if (colorCount.value === 3) return 'week-day-swatch--split-3'
  return 'week-day-swatch--split-4'
})
</script>

<template>
  <div
    class="week-day-swatch"
    :class="[layoutClass, { 'week-day-swatch--empty': colorCount === 0 }]"
    :title="title"
  >
    <span
      v-for="(color, index) in limitedColors"
      :key="`${color}-${index}`"
      class="week-day-swatch__cell"
      :style="{ backgroundColor: color }"
    ></span>
  </div>
</template>

<style scoped>
.week-day-swatch {
  width: var(--swatch-size, 16px);
  height: var(--swatch-size, 16px);
  border-radius: 4px;
  border: 2px solid rgba(90, 77, 67, 0.35);
  background: rgba(90, 77, 67, 0.25);
  display: grid;
  overflow: hidden;
  box-shadow: 1px 1px 0 rgba(47, 39, 33, 0.25);
}

.week-day-swatch__cell {
  width: 100%;
  height: 100%;
  border-radius: 2px;
}

.week-day-swatch--single {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  gap: 0;
  padding: 0;
  background: transparent;
}

.week-day-swatch--split-2 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
  gap: var(--swatch-gap, 1px);
  padding: var(--swatch-gap, 1px);
}

.week-day-swatch--split-3 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr;
  gap: var(--swatch-gap, 1px);
  padding: var(--swatch-gap, 1px);
}

.week-day-swatch--split-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: var(--swatch-gap, 1px);
  padding: var(--swatch-gap, 1px);
}

.week-day-swatch--empty {
  background: rgba(255, 255, 255, 0.5);
  border-style: dashed;
  opacity: 0.6;
}
</style>
