<script setup lang="ts">
import type { TagType, TagMeta, MemberTag, TypeTag } from '@/types/schedule'
import type { WeekIdentifier } from '@/data/utils/scheduleUtils'
import WeekSelector from './WeekSelector.vue'
import TagFilter from './TagFilter.vue'

const props = defineProps<{
  currentWeek: WeekIdentifier
  availableWeeks: WeekIdentifier[]
  weekRangeLabel: string
  totalSessions: number
  tagMeta: Record<TagType, TagMeta>
  memberTags: MemberTag[]
  typeTags: TypeTag[]
  tagCounts: Record<TagType, number>
  selectedTags: TagType[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'update:currentWeek': [weekId: WeekIdentifier]
  'update:selectedTags': [tags: TagType[]]
}>()

const updateCurrentWeek = (weekId: WeekIdentifier) => {
  emit('update:currentWeek', weekId)
}

const updateSelectedTags = (tags: TagType[]) => {
  emit('update:selectedTags', tags)
}
</script>

<template>
  <section class="hero">
    <div class="hero__titles">
      <div class="pill">Shadcn-inspired weekly view</div>
      <h1>Hi A-SOUL story</h1>
      <p>
        Curated blocks that blend deep work, collaboration, and rest. Stay aligned with the plan
        while keeping space for real life.
      </p>

      <!-- 周选择器 -->
      <div class="hero__week-selector">
        <WeekSelector
          :current-week="currentWeek"
          :available-weeks="availableWeeks"
          @update:current-week="updateCurrentWeek"
        />
      </div>
    </div>

    <!-- 标签筛选器 -->
    <TagFilter
      :tag-meta="tagMeta"
      :member-tags="memberTags"
      :type-tags="typeTags"
      :tag-counts="tagCounts"
      :selected-tags="selectedTags"
      @update:selected-tags="updateSelectedTags"
    />
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

/* 高度受限时隐藏 Hero 部分 */
@media (max-height: 1000px) {
  .hero {
    display: none;
  }
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

.hero__week-selector {
  margin: 16px 0;
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

.stat__loading {
  color: #94a3b8;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
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
</style>
