<script setup lang="ts">
import { computed } from 'vue'
import type { TagType, TagMeta, TypeTag } from '@/types/ui'
import type { LiveRecordView } from '@/domain/records'
import EventItem from './EventItem.vue'

const props = defineProps<{
  period: 'morning' | 'afternoon'
  title: string
  icon: string
  events: LiveRecordView[]
  tagMeta: Record<TagType, TagMeta>
  typeTags: TypeTag[]
}>()

const hasEvents = computed(() => props.events.length > 0)
</script>

<template>
  <div class="section" :class="[`section--${period}`, { 'section--empty': !hasEvents }]">
    <div class="section__header">
      <div class="section__line"></div>
      <div class="section__label">
        <span class="section__icon">{{ icon }}</span>
        <span>{{ title }}</span>
        <span v-if="hasEvents" class="section__count">{{ events.length }}</span>
      </div>
      <div class="section__line"></div>
    </div>
    <div class="section__body">
      <div v-if="hasEvents" class="stack">
        <EventItem
          v-for="event in events"
          :key="event.record.id"
          :event="event"
          :tag-meta="tagMeta"
          :type-tags="typeTags"
        />
      </div>
      <div v-else class="section__empty">暂无安排</div>
    </div>
  </div>
</template>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: var(--section-gap, 12px);
  padding: var(--section-padding, 8px);
  border-radius: var(--radius-md);
  position: relative;
  overflow: visible;
  transition: all 200ms ease;
}

.section__body {
  display: flex;
  flex-direction: column;
  gap: var(--section-body-gap, 12px);
  min-height: 0;
  overflow-x: visible;
  overflow-y: hidden;
  padding: var(--section-body-padding, 8px);
  overscroll-behavior: contain;
  scrollbar-width: none;
  scrollbar-color: transparent transparent;
}

.section__body::-webkit-scrollbar {
  width: 0;
}

.section__body::-webkit-scrollbar-track {
  background: transparent;
}

.section__body::-webkit-scrollbar-thumb {
  background: transparent;
}

.section:hover .section__body,
.section:focus-within .section__body {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--outline-rgb) / 0.5) transparent;
}

.section:hover .section__body::-webkit-scrollbar,
.section:focus-within .section__body::-webkit-scrollbar {
  width: 8px;
}

.section:hover .section__body::-webkit-scrollbar-track,
.section:focus-within .section__body::-webkit-scrollbar-track {
  background: transparent;
}

.section:hover .section__body::-webkit-scrollbar-thumb,
.section:focus-within .section__body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--surface-rose-soft), var(--surface-sun));
  border-radius: 999px;
  border: 2px solid var(--glass-70);
  box-shadow: inset 0 0 0 1px rgb(var(--outline-rgb) / 0.25);
}

.section:hover .section__body::-webkit-scrollbar-thumb:hover,
.section:focus-within .section__body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--surface-rose), var(--surface-sun-strong));
}

.section--empty {
  padding: var(--section-empty-padding, 6px 10px);
  gap: var(--section-empty-gap, 4px);
  min-height: auto;
}

.section--empty .section__header {
  margin-bottom: 0;
}

.section--empty .section__label {
  padding: var(--section-empty-label-padding, 2px 8px);
  font-size: var(--section-empty-label-font, 11px);
}

.section--empty .section__icon {
  font-size: var(--section-empty-icon-size, 14px);
}

.section--empty .section__empty {
  padding: var(--section-empty-text-padding, 4px 8px);
  font-size: var(--section-empty-text-font, 11px);
}

.section::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.6;
  pointer-events: none;
}

.section--morning {
  background:
    linear-gradient(
      135deg,
      var(--surface-warm-strong) 0%,
      var(--surface-warm-deep) 60%,
      var(--surface-warm) 100%
    );
  border: 2px solid var(--outline);
  box-shadow:
    3px 3px 0 var(--shadow),
    inset 0 2px 0 var(--glass-60);
  flex: 0 0 auto;
  overflow: visible;
}

.section--morning:hover {
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    inset 0 2px 0 var(--glass-70);
}

.section--afternoon {
  background:
    linear-gradient(
      135deg,
      var(--surface-cool) 0%,
      var(--surface-rose) 55%,
      var(--surface-warm) 100%
    );
  border: 2px solid var(--outline);
  box-shadow:
    3px 3px 0 var(--shadow),
    inset 0 2px 0 var(--glass-60);
  flex: 1 1 auto;
  min-height: 0;
}

.section--morning .section__body {
  max-height: var(--morning-body-max, clamp(120px, 22vh, 220px));
}

.section--afternoon .section__body {
  flex: 1;
}

.section--afternoon:hover {
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    inset 0 2px 0 var(--glass-70);
}

.section__header {
  display: flex;
  align-items: center;
  gap: var(--section-header-gap, 10px);
  margin-bottom: 4px;
}

.section__line {
  flex: 1;
  height: 2px;
  background: currentColor;
  opacity: 0.35;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.section__line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--glass-60), transparent);
  animation: shimmer 2.6s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.section--morning .section__line {
  background: linear-gradient(90deg, transparent, var(--sun), transparent);
}

.section--afternoon .section__line {
  background: linear-gradient(90deg, transparent, var(--sky), transparent);
}

.section__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  transition: all 200ms ease;
  font-family: var(--font-display);
}

.section__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--surface-base);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  margin-left: 2px;
  border: 2px solid var(--outline);
  box-shadow: 2px 2px 0 var(--shadow);
}

.section--morning .section__label {
  color: var(--ink);
  background: rgb(var(--sun-rgb) / 0.4);
  border: 2px solid var(--outline);
}

.section--afternoon .section__label {
  color: var(--ink);
  background: rgb(var(--sky-rgb) / 0.2);
  border: 2px solid var(--outline);
}

.section__icon {
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgb(var(--ink-deep-rgb) / 0.1));
}

.section__empty {
  color: var(--ink-soft);
  font-size: 13px;
  text-align: center;
  padding: 12px;
  font-style: italic;
  font-weight: 600;
  opacity: 0.7;
}

@media (max-height: 700px) {
  .section__empty {
    display: none;
  }
}

.stack {
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap, 12px);
}
</style>
