<script setup lang="ts">
import type { TagType, TagMeta } from '@/types/schedule'
import { memberTags } from '@/data/schedule'

const props = defineProps<{
  weekRangeLabel: string
  totalSessions: number
  tagMeta: Record<TagType, TagMeta>
  tagCounts: Record<TagType, number>
}>()
</script>

<template>
  <section class="hero">
    <div class="hero__titles">
      <div class="pill">Shadcn-inspired weekly view</div>
      <h1>Flow-first weekly agenda</h1>
      <p>
        Curated blocks that blend deep work, collaboration, and rest. Stay aligned with the plan
        while keeping space for real life.
      </p>
      <div class="hero__stats">
        <div class="stat">
          <div class="stat__label">Week</div>
          <div class="stat__value">{{ weekRangeLabel }}</div>
        </div>
        <div class="stat">
          <div class="stat__label">Sessions</div>
          <div class="stat__value">{{ totalSessions }}</div>
        </div>
        <div class="stat">
          <div class="stat__label">Focus mix</div>
          <div class="stat__value">Deep work · Delivery · Rest</div>
        </div>
      </div>
    </div>
    <div class="hero__glass">
      <div class="glass__title">This week</div>
      <div class="glass__grid">
        <div
          v-for="tag in memberTags"
          :key="tag"
          class="chip"
        >
          <span class="chip__dot" :style="{ backgroundColor: tagMeta[tag].color }" />
          {{ tagMeta[tag].label }}
          <span class="chip__count">{{ tagCounts[tag] || 0 }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 20px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.hero__titles h1 {
  margin: 8px 0;
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__titles p {
  margin: 0 0 16px;
  color: #64748b;
  max-width: 520px;
  line-height: 1.6;
}

.hero__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.stat {
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.stat__label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

.stat__value {
  margin-top: 6px;
  font-weight: 600;
  color: #334155;
  font-size: 14px;
}

.hero__glass {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.glass__title {
  font-size: 12px;
  letter-spacing: 0.06em;
  color: #6366f1;
  text-transform: uppercase;
  margin-bottom: 14px;
  font-weight: 600;
}

.glass__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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

.chip__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
}

.chip__count {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 11px;
  font-weight: 600;
}
</style>
