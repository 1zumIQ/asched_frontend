<script setup lang="ts">
import { computed } from 'vue'
import type { ScheduleEvent, TagType, TagMeta, MemberTag, TypeTag } from '@/types/schedule'
import { memberTags, energyTags } from '@/data/schedule'

const props = defineProps<{
  event: ScheduleEvent
  tagMeta: Record<TagType, TagMeta>
}>()

const avatarInitials = computed(() => {
  const words = props.event.title.split(' ')
  if (words.length >= 2 && words[0] && words[1] && words[0][0] && words[1][0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return props.event.title.slice(0, 2).toUpperCase()
})

// 获取主分类标签（第一个成员标签）
const primaryTag = computed<TagType>(() => {
  const found = props.event.tags.find((t) => memberTags.includes(t as MemberTag))
  if (found) return found
  if (props.event.tags[0]) return props.event.tags[0]
  return '思诺' as TagType
})

// 获取类型标签
const typeTag = computed(() => {
  return props.event.tags.find((t) => energyTags.includes(t as TypeTag))
})
</script>

<template>
  <div class="event">
    <div class="event__content">
      <div class="event__left">
        <div class="event__time">{{ event.time }}</div>
        <div class="event__body">
          <div class="event__title">
            <span class="dot" :style="{ backgroundColor: tagMeta[primaryTag].color }"></span>
            <div>
              <div class="event__name">{{ event.title }}</div>
              <div class="event__meta">
                <span v-if="event.location">{{ event.location }}</span>
                <span v-if="event.note"> · {{ event.note }}</span>
              </div>
            </div>
          </div>
          <div class="event__tags">
            <span
              v-for="tag in event.tags"
              :key="tag"
              class="chip"
              :class="{ 'chip--type': energyTags.includes(tag as any) }"
              :style="{
                borderColor: tagMeta[tag].color,
                color: tagMeta[tag].color,
                backgroundColor: tagMeta[tag].tint,
              }"
            >
              {{ tagMeta[tag].label }}
            </span>
          </div>
        </div>
      </div>
      <div
        class="avatar"
        :style="{
          backgroundColor: tagMeta[primaryTag].tint,
          color: tagMeta[primaryTag].color,
          borderColor: tagMeta[primaryTag].color,
          backgroundImage: tagMeta[primaryTag].avatar ? `url(${tagMeta[primaryTag].avatar})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      >
        <span v-if="!tagMeta[primaryTag].avatar">{{ avatarInitials }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #fafafa 0%, #f8fafc 100%);
  transition: background 150ms ease;
}

.event:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%);
}

.event__content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.event__left {
  flex: 1;
  min-width: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.event__time {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 6px;
}

.event__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event__title {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.event__name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.event__meta {
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 2px;
}

.event__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
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
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
  flex-shrink: 0;
}

.chip--type {
  border-radius: 999px;
}

@media (max-width: 720px) {
  .event__tags {
    justify-content: flex-start;
  }
}
</style>
