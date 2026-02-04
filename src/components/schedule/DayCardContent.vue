<script setup lang="ts">
import { computed } from 'vue'
import type { DayCard, MemberTag, TagMeta, TagType, TypeTag } from '@/types/ui'
import type { LiveRecordView } from '@/domain/records'
import DayCardHeader from './DayCardHeader.vue'
import DayCardStats from './DayCardStats.vue'
import DayCardSections from './DayCardSections.vue'

const {
  day,
  totalEvents,
  memberStats,
  morningEvents,
  afternoonEvents,
  tagMeta,
  typeTags,
  variant,
  statsCollapsible,
  dividerCollapsible,
} = defineProps<{
  day: DayCard<LiveRecordView>
  totalEvents: number
  memberStats: Array<[MemberTag, number]>
  morningEvents: LiveRecordView[]
  afternoonEvents: LiveRecordView[]
  tagMeta: Record<TagType, TagMeta>
  typeTags: TypeTag[]
  variant?: 'card' | 'modal'
  statsCollapsible?: boolean
  dividerCollapsible?: boolean
}>()

const hasEvents = computed(() => totalEvents > 0)
</script>

<template>
  <DayCardHeader :day="day" :total-events="totalEvents" :variant="variant" />

  <DayCardStats
    v-if="memberStats.length > 0"
    :stats="memberStats"
    :tag-meta="tagMeta"
    :variant="variant"
    :collapsible="statsCollapsible"
  />

  <div v-if="!hasEvents" class="empty">
    暂无安排 睡大觉喽！
  </div>
  <DayCardSections
    v-else
    :variant="variant"
    :morning-events="morningEvents"
    :afternoon-events="afternoonEvents"
    :tag-meta="tagMeta"
    :type-tags="typeTags"
    :collapsible-divider="dividerCollapsible"
  />
</template>

<style scoped>
.empty {
  padding: 24px 16px;
  border-radius: var(--radius-md);
  border: 2px dashed rgb(var(--ink-deep-rgb) / 0.25);
  color: var(--ink-soft);
  background: linear-gradient(135deg, var(--surface-base) 0%, var(--surface-warm-soft) 100%);
  font-size: 14px;
  text-align: center;
  font-weight: 600;
  transition: all 200ms ease;
}

.empty:hover {
  border-color: var(--outline);
  color: var(--ink);
  background: linear-gradient(135deg, var(--surface-base), var(--surface-rose));
}
</style>
