<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  colors: string[]
  title?: string
}>()

const colorCount = computed(() => props.colors.length)
const isRainbow = computed(() => colorCount.value > 4)
const isEmpty = computed(() => colorCount.value === 0)
const limitedColors = computed(() => (isRainbow.value ? [] : props.colors.slice(0, 4)))

const layoutClass = computed(() => {
  if (isEmpty.value) return 'week-day-swatch--empty'
  if (colorCount.value <= 1) return 'week-day-swatch--single'
  if (colorCount.value === 2) return 'week-day-swatch--split-2'
  if (colorCount.value === 3) return 'week-day-swatch--split-3'
  if (colorCount.value === 4) return 'week-day-swatch--split-4'
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
  border: 2px solid rgb(var(--outline-rgb) / 0.35);
  background: rgb(var(--outline-rgb) / 0.25);
  display: grid;
  overflow: hidden;
  box-shadow: 1px 1px 0 rgb(var(--ink-rgb) / 0.25);
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
    var(--rainbow-1) 0%,
    var(--rainbow-2) 20%,
    var(--rainbow-3) 40%,
    var(--rainbow-4) 60%,
    var(--rainbow-5) 80%,
    var(--rainbow-1) 100%
  );
  border-style: solid;
  border-color: rgb(var(--outline-rgb) / 0.25);
  padding: var(--swatch-gap, 1px);
}

.week-day-swatch--empty {
  background: rgb(var(--white-rgb) / 0.5);
  border-style: dashed;
  opacity: 0.6;
}
</style>
