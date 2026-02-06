<script setup lang="ts">
import type { TagType, TagMeta, MemberTag, TypeTag, ThemeName } from '@/types/ui'
import type { IsoWeek } from '@/utils/isoWeek'
import TagFilter from './TagFilter.vue'
import ThemeToggle from './ThemeToggle.vue'
import WeekSelector from './WeekSelector.vue'

const {
  currentWeek,
  availableWeeks,
  tagMeta,
  memberTags,
  typeTags,
  tagCounts,
  selectedTags,
  theme,
} = defineProps<{
  currentWeek: IsoWeek
  availableWeeks: IsoWeek[]
  weekRangeLabel: string
  totalSessions: number
  tagMeta: Record<TagType, TagMeta>
  memberTags: MemberTag[]
  typeTags: TypeTag[]
  tagCounts: Record<TagType, number>
  selectedTags: TagType[]
  theme: ThemeName
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'update:currentWeek': [week: IsoWeek]
  'update:selectedTags': [tags: TagType[]]
  'update:theme': [theme: ThemeName]
}>()

const updateCurrentWeek = (week: IsoWeek) => {
  emit('update:currentWeek', week)
}

const updateSelectedTags = (tags: TagType[]) => {
  emit('update:selectedTags', tags)
}

const updateTheme = (value: ThemeName) => {
  emit('update:theme', value)
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

      <div class="hero__actions">
        <ThemeToggle :theme="theme" @update:theme="updateTheme" />
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
    linear-gradient(
      135deg,
      var(--surface-warm-strong) 0%,
      var(--surface-rose) 45%,
      var(--page-bg-cool) 100%
    );
  border: 2px solid var(--outline);
  border-radius: var(--radius-xl);
  padding: 22px;
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 18px 36px rgb(var(--ink-deep-rgb) / 0.18);
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
    radial-gradient(circle at 20% 20%, var(--glass-60) 0%, transparent 35%),
    radial-gradient(circle at 80% 10%, var(--glass-60) 0%, transparent 30%),
    radial-gradient(
      circle at 10% 80%,
      rgb(var(--schedule-accent-mint-rgb) / 0.2) 0%,
      transparent 40%
    );
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
  border: 3px dashed rgb(var(--ink-deep-rgb) / 0.35);
  background: rgb(var(--white-rgb) / 0.35);
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
    linear-gradient(90deg, var(--glass-70), rgb(var(--schedule-accent-warm-rgb) / 0.6));
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
      rgb(var(--schedule-accent-hot-rgb) / 0.65) 0 16px,
      rgb(var(--schedule-accent-warm-rgb) / 0.65) 16px 32px,
      rgb(var(--schedule-accent-mint-rgb) / 0.65) 32px 48px,
      rgb(var(--schedule-accent-cool-rgb) / 0.65) 48px 64px
    );
  box-shadow: 2px 2px 0 rgb(var(--ink-deep-rgb) / 0.2);
  transform: rotate(-0.8deg);
  animation: underline-wiggle 4.6s ease-in-out infinite;
}

.hero-title__text {
  display: inline-block;
  color: var(--ink);
  background: linear-gradient(
    120deg,
    var(--schedule-accent-hot) 0%,
    var(--schedule-accent-berry) 35%,
    var(--schedule-accent-cool) 70%,
    var(--schedule-accent-warm) 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 3px 3px 0 rgb(var(--ink-deep-rgb) / 0.12);
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
  background: linear-gradient(135deg, var(--surface-warm), var(--surface-rose-soft));
  border: 2px solid var(--outline);
  box-shadow: 2px 2px 0 var(--shadow);
  font-size: 14px;
  color: var(--schedule-accent-hot);
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

.hero__actions {
  margin-top: 12px;
  max-width: 320px;
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
  background: var(--glass-85);
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
  background: var(--surface-base);
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
  box-shadow: 2px 2px 0 var(--shadow);
  transform: rotate(-2deg);
}

/* ========== SHADCN/UI MINIMALIST DARK OVERRIDES ========== */
:root[data-theme='dark'] .hero {
  background: var(--surface-warm);
  box-shadow:
    var(--shadow-strong),
    0 0 0 1px var(--outline);
}

:root[data-theme='dark'] .hero::before {
  /* Subtle gradient overlay */
  background-image: linear-gradient(
    135deg,
    var(--surface-warm-strong),
    transparent 60%
  );
  opacity: 0.5;
}

:root[data-theme='dark'] .hero::after {
  /* Clean decorative circle */
  border-color: var(--outline);
  background: transparent;
  animation: float-calm 8s ease-in-out infinite;
}

@keyframes float-calm {
  0%, 100% { transform: rotate(-8deg) translateY(0); }
  50% { transform: rotate(-8deg) translateY(-4px); }
}

:root[data-theme='dark'] .hero-title::before {
  background: var(--surface-warm-strong);
  opacity: 1;
}

:root[data-theme='dark'] .hero-title::after {
  background: linear-gradient(90deg, var(--schedule-accent-cool), transparent);
  box-shadow: none;
  height: 2px;
  bottom: -4px;
}

:root[data-theme='dark'] .hero-title__spark {
  background: var(--surface-warm-strong);
  color: var(--schedule-accent-cool);
  box-shadow: var(--shadow);
  border-color: var(--outline);
  animation: none;
}

:root[data-theme='dark'] .pill {
  background: var(--surface-warm-strong);
  border-color: var(--outline);
  box-shadow: var(--shadow);
  color: var(--ink);
}
</style>


