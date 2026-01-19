<script setup lang="ts">
import type { TagType, TagMeta } from '@/types/schedule'
import { memberTags } from '@/data/schedule'

defineProps<{
  tagMeta: Record<TagType, TagMeta>
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
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.legend__title {
  font-size: 11px;
  text-transform: uppercase;
  color: #6366f1;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  font-weight: 600;
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
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
}

.pill--light {
  color: #0369a1;
  background: linear-gradient(135deg, #e0f2fe, #bae6fd);
  border: 1px solid #7dd3fc;
}

.pill--steady {
  color: #7c3aed;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  border: 1px solid #c4b5fd;
}

.pill--intense {
  color: #dc2626;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1px solid #fca5a5;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
}

.chip--soft {
  border-color: transparent;
}
</style>
