<script setup lang="ts">
import { computed } from 'vue'
import type { TagType, TagMeta, MemberTag, TypeTag } from '@/types/ui'

const props = defineProps<{
  tagMeta: Record<TagType, TagMeta>
  memberTags: MemberTag[]
  typeTags: TypeTag[]
  tagCounts: Record<TagType, number>
  selectedTags: TagType[]
}>()

const emit = defineEmits<{
  'update:selectedTags': [tags: TagType[]]
}>()

// 成员标签统计
const memberTagStats = computed(() => {
  return props.memberTags.map(tag => ({
    tag,
    label: props.tagMeta[tag].label,
    color: props.tagMeta[tag].color,
    tint: props.tagMeta[tag].tint,
    count: props.tagCounts[tag] || 0,
    selected: props.selectedTags.includes(tag)
  })).sort((a, b) => b.count - a.count)
})

// 类型标签统计
const typeTagStats = computed(() => {
  return props.typeTags.map(tag => ({
    tag,
    label: props.tagMeta[tag].label,
    color: props.tagMeta[tag].color,
    tint: props.tagMeta[tag].tint,
    count: props.tagCounts[tag] || 0,
    selected: props.selectedTags.includes(tag)
  })).sort((a, b) => b.count - a.count)
})

// 切换标签选择
const toggleTag = (tag: TagType) => {
  const newSelected = props.selectedTags.includes(tag)
    ? props.selectedTags.filter(t => t !== tag)
    : [...props.selectedTags, tag]
  emit('update:selectedTags', newSelected)
}

// 清除所有筛选
const clearAll = () => {
  emit('update:selectedTags', [])
}

// 是否有筛选
const hasFilters = computed(() => props.selectedTags.length > 0)

</script>

<template>
  <div class="tag-filter" :class="{ 'tag-filter--active': hasFilters }">
    <div class="tag-filter__header">
      <div class="tag-filter__title">本周统计</div>
      <button
        class="tag-filter__clear"
        :class="{ 'tag-filter__clear--hidden': !hasFilters }"
        @click="clearAll"
        :disabled="!hasFilters"
        :tabindex="hasFilters ? 0 : -1"
        :aria-hidden="!hasFilters"
      >
        清除筛选
      </button>
    </div>

    <!-- 成员标签 -->
    <div class="tag-filter__section">
      <div class="tag-filter__section-title">
        <span class="tag-filter__section-icon">👥</span>
        成员
      </div>
      <div class="tag-filter__grid">
        <button
          v-for="stat in memberTagStats"
          :key="stat.tag"
          class="tag-chip"
          :class="{ 'tag-chip--selected': stat.selected, 'tag-chip--disabled': stat.count === 0 }"
          :style="{
            '--tag-color': stat.color,
            '--tag-tint': stat.tint
          }"
          @click="toggleTag(stat.tag)"
          :disabled="stat.count === 0"
        >
          <span class="tag-chip__dot" :style="{ backgroundColor: stat.color }" />
          <span class="tag-chip__label">{{ stat.label }}</span>
          <span class="tag-chip__count">{{ stat.count }}</span>
        </button>
      </div>
    </div>

    <!-- 类型标签 -->
    <div class="tag-filter__section">
      <div class="tag-filter__section-title">
        <span class="tag-filter__section-icon">📝</span>
        类型
      </div>
      <div class="tag-filter__grid">
        <button
          v-for="stat in typeTagStats"
          :key="stat.tag"
          class="tag-chip"
          :class="{ 'tag-chip--selected': stat.selected, 'tag-chip--disabled': stat.count === 0 }"
          :style="{
            '--tag-color': stat.color,
            '--tag-tint': stat.tint
          }"
          @click="toggleTag(stat.tag)"
          :disabled="stat.count === 0"
        >
          <span class="tag-chip__dot" :style="{ backgroundColor: stat.color }" />
          <span class="tag-chip__label">{{ stat.label }}</span>
          <span class="tag-chip__count">{{ stat.count }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-filter {
  border: 2px solid var(--outline);
  border-radius: var(--radius-lg);
  padding: 16px;
  background:
    linear-gradient(135deg, #ffffff 0%, #fff7d6 100%);
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    0 14px 24px rgba(31, 27, 22, 0.14);
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  overflow: hidden;
}

.tag-filter--active {
  border-color: transparent;
  background:
    linear-gradient(135deg, #ffffff 0%, #fff7d6 100%) padding-box,
    linear-gradient(
      90deg,
      #ff6b6b 0%,
      #ffd93d 20%,
      #6bcb77 40%,
      #4d96ff 60%,
      #845ef7 80%,
      #ff6b6b 100%
    ) border-box;
}

.tag-filter::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.7) 0%, transparent 45%),
    radial-gradient(circle at 90% 10%, rgba(255, 209, 102, 0.3) 0%, transparent 40%);
  opacity: 0.7;
  pointer-events: none;
}

.tag-filter__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.tag-filter__title {
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--ink);
  text-transform: uppercase;
  font-weight: 800;
  font-family: var(--font-display);
}

.tag-filter__clear {
  padding: 4px 12px;
  border-radius: 999px;
  border: 2px solid var(--outline);
  background: #fff;
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 2px 2px 0 var(--shadow);
  position: relative;
  z-index: 1;
}

.tag-filter__clear:hover {
  background: var(--coral);
  border-color: var(--outline);
  color: #fff;
  transform: translate(-1px, -1px) rotate(-2deg);
}

.tag-filter__clear--hidden {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.tag-filter__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.tag-filter__section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-soft);
}

.tag-filter__section-icon {
  font-size: 14px;
}

.tag-filter__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  border: 2px solid var(--outline);
  background: var(--tag-tint, #fff7d6);
  color: var(--tag-color, var(--ink));
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 2px 2px 0 var(--shadow);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.tag-chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.65), transparent 60%);
  opacity: 0.6;
  transition: opacity 200ms ease;
}

.tag-chip:hover:not(:disabled) {
  transform: translate(-2px, -2px) rotate(-1.5deg);
  box-shadow: 4px 4px 0 var(--shadow-strong);
}

.tag-chip:hover:not(:disabled)::before {
  opacity: 0.9;
}

.tag-chip--selected {
  background: var(--tag-tint, #fff7d6);
  border-color: var(--tag-color, var(--outline));
  color: var(--tag-color, var(--ink));
  font-weight: 800;
  box-shadow: 4px 4px 0 var(--shadow-strong);
}

.tag-chip--selected::before {
  opacity: 1;
}

.tag-chip--selected:hover:not(:disabled) {
  box-shadow: 5px 5px 0 var(--shadow-strong);
}

.tag-chip--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tag-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px #ffffff, 2px 2px 0 rgba(31, 27, 22, 0.4);
  position: relative;
  z-index: 1;
}

.tag-chip__label {
  flex: 1;
  text-align: left;
  position: relative;
  z-index: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-chip__count {
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--outline);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: all 200ms ease;
  box-shadow: 2px 2px 0 rgba(47, 39, 33, 0.3);
}

.tag-chip--selected .tag-chip__count {
  background: var(--tag-color, var(--ink));
  color: #fff;
}

/* 响应式 */
@media (max-width: 768px) {
  .tag-filter {
    padding: 12px;
    gap: 12px;
  }

  .tag-filter__grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 6px;
  }

  .tag-chip {
    padding: 5px 8px;
    font-size: 11px;
  }
}
</style>

