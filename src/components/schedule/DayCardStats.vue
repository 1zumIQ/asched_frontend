<script setup lang="ts">
import { computed } from 'vue'
import type { TagType, TagMeta } from '@/types/ui'

const props = defineProps<{
  stats: Array<[string, number]>
  tagMeta: Record<TagType, TagMeta>
  variant?: 'card' | 'modal'
  collapsible?: boolean
}>()

const rootClass = computed(() => {
  const base = props.variant === 'modal' ? 'modal-stats' : 'day-card__stats'
  return [
    base,
    props.collapsible ? 'day-card__stats--collapsible' : ''
  ]
})
</script>

<template>
  <div :class="rootClass">
    <div class="stats-label">今日成员</div>
    <div class="stats-members">
      <div
        v-for="[member, count] in stats"
        :key="member"
        class="stats-member"
        :style="{
          backgroundColor: tagMeta[member as TagType]?.tint,
          borderColor: tagMeta[member as TagType]?.color,
          color: tagMeta[member as TagType]?.color
        }"
      >
        <span class="stats-member__name">{{ tagMeta[member as TagType]?.label }}</span>
        <span class="stats-member__count">×{{ count }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.day-card__stats,
.modal-stats {
  padding: var(--stats-padding, 12px);
  background: linear-gradient(135deg, var(--surface-base), var(--surface-warm));
  border-radius: var(--radius-md);
  border: 2px dashed rgb(var(--outline-rgb) / 0.3);
  margin-bottom: var(--stats-margin-bottom, 16px);
}

.day-card__stats {
  animation: stats-appear 400ms ease-out;
}

.modal-stats {
  margin-bottom: 20px;
  border-color: rgb(var(--outline-rgb) / 0.25);
}

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
  color: var(--ink-soft);
  margin-bottom: 8px;
  font-family: var(--font-display);
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
  box-shadow: 2px 2px 0 var(--shadow);
}

.stats-member:hover {
  transform: translate(-2px, -2px) scale(1.05);
  box-shadow: 4px 4px 0 var(--shadow-strong);
}

.stats-member__name {
  letter-spacing: -0.01em;
}

.stats-member__count {
  font-size: 11px;
  opacity: 0.8;
  font-weight: 800;
}
</style>
