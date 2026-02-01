<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  colors: string[]
  title?: string
}>()

const rawCount = computed(() => props.colors.length)
const isRainbow = computed(() => rawCount.value > 4)
const isEmpty = computed(() => rawCount.value === 0)
const limitedColors = computed(() => (isRainbow.value ? [] : props.colors.slice(0, 4)))

const layoutClass = computed(() => {
  if (isEmpty.value) return 'week-day-swatch--empty'
  if (rawCount.value <= 1) return 'week-day-swatch--single'
  if (rawCount.value === 2) return 'week-day-swatch--split-2'
  if (rawCount.value === 3) return 'week-day-swatch--split-3'
  if (rawCount.value === 4) return 'week-day-swatch--split-4'
  return 'week-day-swatch--rainbow'
})
</script>

<template>
  <div class="week-day-swatch" :class="layoutClass" :title="title">
    <span
      v-if="!isRainbow"
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

.week-day-swatch--rainbow {
  background: linear-gradient(
    135deg,
    #ff6b6b 0%,
    #ffd93d 20%,
    #6bcb77 40%,
    #4d96ff 60%,
    #845ef7 80%,
    #ff6b6b 100%
  );
  border-style: solid;
  border-color: rgba(90, 77, 67, 0.25);
  padding: var(--swatch-gap, 1px);
}

.week-day-swatch--empty {
  background: rgba(255, 255, 255, 0.5);
  border-style: dashed;
  opacity: 0.6;
}
</style>
