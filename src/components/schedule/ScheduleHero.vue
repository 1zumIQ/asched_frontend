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
      <div class="pill">枝江娱乐日程表</div>
      <h1 class="hero-title">
        <span class="hero-title__text">Hi A-SOUL story</span>
        <span class="hero-title__spark" aria-hidden="true">✦</span>
      </h1>
      <p>
        Curated blocks that blend deep work, collaboration, and rest. Stay aligned with the plan
        while keeping space for real life.
      </p>

      <!-- 周选择器 -->
      <div class="hero__week-selector">
        <WeekSelector
          :current-week="currentWeek"
          :available-weeks="availableWeeks"
          :tag-meta="tagMeta"
          :member-tags="memberTags"
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
  background:
    linear-gradient(135deg, #fff4b8 0%, #ffd1ef 45%, #b9f3ff 100%);
  border: 2px solid var(--outline);
  border-radius: var(--radius-xl);
  padding: 22px;
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 18px 36px rgba(31, 27, 22, 0.18);
  position: relative;
  overflow: visible;
  animation: hero-pop 600ms ease-out;
  flex-shrink: 0;
  z-index: 10;
}

.hero__titles {
  position: relative;
  z-index: 12;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 35%),
    radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.5) 0%, transparent 30%),
    radial-gradient(circle at 10% 80%, rgba(6, 214, 160, 0.2) 0%, transparent 40%);
  opacity: 0.7;
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  top: -18px;
  right: 12%;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px dashed rgba(31, 27, 22, 0.35);
  background: rgba(255, 255, 255, 0.35);
  transform: rotate(-8deg);
  pointer-events: none;
}

@keyframes hero-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 高度受限时隐藏 Hero 部分 */
@media (max-height: 1000px) {
  .hero {
    display: none;
  }
}

.hero-title {
  margin: 8px 0;
  font-size: clamp(28px, 4.6vw, 38px);
  font-weight: 700;
  letter-spacing: 0.01em;
  display: block;
  width: fit-content;
  max-width: 100%;
  position: relative;
}

.hero-title::before {
  content: '';
  position: absolute;
  left: -10px;
  right: 12px;
  bottom: -4px;
  height: 14px;
  border-radius: 999px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.7), rgba(255, 209, 102, 0.6));
  filter: blur(0.5px);
  opacity: 0.8;
  transform: rotate(-1.5deg);
  z-index: -1;
}

.hero-title::after {
  content: '';
  position: absolute;
  left: -6px;
  right: 36px;
  bottom: -10px;
  height: 6px;
  border-radius: 999px;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(255, 107, 107, 0.65) 0 16px,
      rgba(255, 209, 102, 0.65) 16px 32px,
      rgba(6, 214, 160, 0.65) 32px 48px,
      rgba(77, 150, 255, 0.65) 48px 64px
    );
  box-shadow: 2px 2px 0 rgba(31, 27, 22, 0.2);
  transform: rotate(-0.8deg);
  animation: underline-wiggle 4.6s ease-in-out infinite;
}

.hero-title__text {
  display: inline-block;
  color: var(--ink);
  background: linear-gradient(
    120deg,
    var(--coral) 0%,
    var(--berry) 35%,
    var(--sky) 70%,
    var(--sun) 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 3px 3px 0 rgba(31, 27, 22, 0.12);
  animation: title-gradient 6s ease-in-out infinite;
}

.hero-title__spark {
  position: absolute;
  top: -6px;
  right: -24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff7d6, #ffe3f2);
  border: 2px solid var(--outline);
  box-shadow: 2px 2px 0 var(--shadow);
  font-size: 14px;
  color: var(--coral);
  transform: rotate(-8deg);
  animation: sparkle-pop 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes title-gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes underline-wiggle {
  0%, 100% {
    transform: rotate(-0.8deg) translateY(0);
  }
  50% {
    transform: rotate(0.4deg) translateY(2px);
  }
}

@keyframes sparkle-pop {
  0%, 100% {
    transform: rotate(-8deg) scale(1);
    box-shadow: 2px 2px 0 var(--shadow);
  }
  50% {
    transform: rotate(8deg) scale(1.08);
    box-shadow: 4px 4px 0 var(--shadow-strong);
  }
}

.hero__titles p {
  margin: 0 0 16px;
  color: var(--ink-soft);
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
  border: 2px solid var(--outline);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 2px 2px 0 var(--shadow);
}

.stat__label {
  font-size: 11px;
  color: var(--ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

.stat__value {
  margin-top: 6px;
  font-weight: 700;
  color: var(--ink);
  font-size: 14px;
}

.stat__loading {
  color: var(--ink-soft);
  animation: wobble 1.5s ease-in-out infinite;
}

@keyframes wobble {
  0%, 100% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.6;
    transform: translateY(-2px);
  }
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 2px solid var(--outline);
  background: #fff;
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
  box-shadow: 2px 2px 0 var(--shadow);
  transform: rotate(-2deg);
}
</style>
