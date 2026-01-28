<script setup lang="ts">
import { computed } from 'vue'
import type { TagType, TagMeta, MemberTag, TypeTag } from '@/types/schedule'

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
  <div class="tag-filter">
    <div class="tag-filter__header">
      <div class="tag-filter__title">本周统计</div>
      <button
        v-if="hasFilters"
        class="tag-filter__clear"
        @click="clearAll"
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
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tag-filter__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tag-filter__title {
  font-size: 12px;
  letter-spacing: 0.06em;
  color: #6366f1;
  text-transform: uppercase;
  font-weight: 600;
}

.tag-filter__clear {
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
}

.tag-filter__clear:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

.tag-filter__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-filter__section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.tag-filter__section-icon {
  font-size: 12px;
}

.tag-filter__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 6px;
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.tag-chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--tag-tint, #f8fafc);
  opacity: 0;
  transition: opacity 200ms ease;
}

.tag-chip:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--tag-color, #e2e8f0);
}

.tag-chip:hover:not(:disabled)::before {
  opacity: 0.5;
}

.tag-chip--selected {
  background: var(--tag-tint, #f8fafc);
  border-color: var(--tag-color, #6366f1);
  color: var(--tag-color, #475569);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.tag-chip--selected::before {
  opacity: 1;
}

.tag-chip--selected:hover:not(:disabled) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
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
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
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
  background: #e0e7ff;
  color: #4338ca;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: all 200ms ease;
}

.tag-chip--selected .tag-chip__count {
  background: var(--tag-color, #6366f1);
  color: white;
}

/* 响应式 */
@media (max-width: 768px) {
  .tag-filter {
    padding: 12px;
    gap: 12px;
  }

  .tag-filter__grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 4px;
  }

  .tag-chip {
    padding: 5px 8px;
    font-size: 11px;
  }
}
</style>
