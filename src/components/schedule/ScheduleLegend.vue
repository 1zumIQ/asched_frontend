<script setup lang="ts">
import type { MemberTag, TagType, TagMeta } from '@/types/schedule'

defineProps<{
  tagMeta: Record<TagType, TagMeta>
  memberTags: MemberTag[]
}>()
</script>

<template>
  <section class="legend">
    <div class="legend__card">
      <div class="legend__title">Tag</div>
      <div class="legend__pills">
        <span class="pill pill--light">Light</span>
        <span class="pill pill--steady">Steady</span>
        <span class="pill pill--intense">Intense</span>
      </div>
    </div>
    <div class="legend__card">
      <div class="legend__title">成员</div>
      <div class="legend__chips">
        <span
          v-for="tag in memberTags"
          :key="tag"
          class="chip chip--soft"
          :style="{
            backgroundColor: tagMeta[tag].tint,
            color: tagMeta[tag].color,
          }"
        >
          {{ tagMeta[tag].label }}
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
  margin: 14px 0 10px;
  flex-shrink: 0;
}

.legend__card {
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--outline);
  background: linear-gradient(135deg, #ffffff, #fff7d6);
  box-shadow: 3px 3px 0 var(--shadow);
}

.legend__title {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--ink);
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  font-weight: 800;
  font-family: var(--font-display);
}

.legend__pills,
.legend__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 2px solid var(--outline);
  background: #fff;
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
  box-shadow: 2px 2px 0 var(--shadow);
}

.pill--light {
  color: var(--ink);
  background: linear-gradient(135deg, #dff1ff, #ffffff);
  border: 2px solid var(--outline);
}

.pill--steady {
  color: var(--ink);
  background: linear-gradient(135deg, #ffe3f2, #ffffff);
  border: 2px solid var(--outline);
}

.pill--intense {
  color: var(--ink);
  background: linear-gradient(135deg, #ffd1ef, #ffffff);
  border: 2px solid var(--outline);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 700;
  border: 2px solid var(--outline);
  background: #fff;
  color: var(--ink);
  box-shadow: 2px 2px 0 var(--shadow);
}

.chip--soft {
  border-color: transparent;
}
</style>
