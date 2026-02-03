<script setup lang="ts">
import type { TagType, TagMeta, TypeTag } from '@/types/ui'
import type { LiveRecordView } from '@/domain/records'
import DayCardSection from './DayCardSection.vue'

defineProps<{
  morningEvents: LiveRecordView[]
  afternoonEvents: LiveRecordView[]
  tagMeta: Record<TagType, TagMeta>
  typeTags: TypeTag[]
  variant?: 'card' | 'modal'
  collapsibleDivider?: boolean
}>()
</script>

<template>
  <div class="sections" :class="{ 'sections--modal': variant === 'modal' }">
    <DayCardSection
      period="morning"
      title="上午"
      icon="☀️"
      :events="morningEvents"
      :tag-meta="tagMeta"
      :type-tags="typeTags"
    />

    <div class="divider" :class="{ 'divider--collapsible': collapsibleDivider }">
      <div class="divider__line"></div>
      <div class="divider__badge">12:00</div>
      <div class="divider__line"></div>
    </div>

    <DayCardSection
      period="afternoon"
      title="下午"
      icon="🌆"
      :events="afternoonEvents"
      :tag-meta="tagMeta"
      :type-tags="typeTags"
    />
  </div>
</template>

<style scoped>
.sections {
  display: flex;
  flex-direction: column;
  gap: var(--sections-gap, 14px);
  flex: 1;
  min-height: 0;
  overflow: visible;
  position: relative;
}

.sections--modal {
  --sections-gap: 16px;
  flex: initial;
}

.divider {
  display: flex;
  align-items: center;
  gap: var(--divider-gap, 10px);
  padding: var(--divider-padding, 6px 0);
  margin: 2px 0;
}

@media (max-height: 800px) {
  .divider--collapsible {
    display: none;
  }
}

.divider__line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--coral) 20%, var(--coral) 80%, transparent);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.divider__line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--glass-80), transparent);
  animation: slide 4s infinite;
}

@keyframes slide {
  0% {
    left: -100%;
  }
  100% {
    left: 150%;
  }
}

.divider__badge {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-on-accent);
  background: linear-gradient(135deg, var(--coral), var(--berry));
  padding: 5px 12px;
  border-radius: 999px;
  box-shadow:
    3px 3px 0 var(--shadow-strong),
    inset 0 1px 0 var(--glass-60);
  white-space: nowrap;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
  border: 2px solid var(--outline);
}

.divider__badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--glass-70), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
