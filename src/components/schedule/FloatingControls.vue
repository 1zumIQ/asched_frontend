<script setup lang="ts">
import { ref } from 'vue'
import WeekSelector from './WeekSelector.vue'
import ThemeToggle from './ThemeToggle.vue'
import type { IsoWeek } from '@/utils/isoWeek'
import type { TagType, TagMeta, MemberTag, ThemeName } from '@/types/ui'

defineProps<{
  currentWeek: IsoWeek
  availableWeeks: IsoWeek[]
  tagMeta: Record<TagType, TagMeta>
  memberTags: MemberTag[]
  theme: ThemeName
  visible: boolean
}>()

const emit = defineEmits<{
  'update:currentWeek': [week: IsoWeek]
  'update:theme': [theme: ThemeName]
}>()

const isOpen = ref(false)

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const closePanel = () => {
  isOpen.value = false
}

const updateCurrentWeek = (week: IsoWeek) => {
  emit('update:currentWeek', week)
  // Optional: close panel on selection? maybe not
}

const updateTheme = (newTheme: ThemeName) => {
  emit('update:theme', newTheme)
}
</script>

<template>
  <Teleport to="body">
    <div class="floating-controls" :class="{ 'floating-controls--visible': visible }">
      <!-- 展开的面板 -->
      <div v-if="isOpen" class="floating-panel">
        <div class="floating-panel__header">
          <span class="floating-panel__title">快捷设置</span>
          <button class="floating-panel__close" @click="closePanel" aria-label="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="floating-panel__content">
          <div class="floating-panel__section">
            <label>周次</label>
            <WeekSelector
              :current-week="currentWeek"
              :available-weeks="availableWeeks"
              :tag-meta="tagMeta"
              :member-tags="memberTags"
              @update:current-week="updateCurrentWeek"
            />
          </div>

          <div class="floating-panel__section">
            <label>主题</label>
            <ThemeToggle :theme="theme" @update:theme="updateTheme" />
          </div>
        </div>
      </div>

      <!-- 悬浮按钮 (FAB) -->
      <button class="fab" @click="togglePanel" :aria-expanded="isOpen" aria-label="打开设置">
        <svg v-if="!isOpen" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.floating-controls {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  pointer-events: none; /* Allow clicking through when button not hovered/clicked */
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 300ms ease, transform 300ms var(--ease-out-back);
}

.floating-controls--visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid var(--outline);
  background: linear-gradient(135deg, var(--surface-warm), var(--surface-rose));
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    0 8px 16px rgb(var(--ink-deep-rgb) / 0.15);
  transition: all 250ms var(--ease-out-back);
}

.fab:hover {
  transform: scale(1.1) rotate(-4deg);
  background: linear-gradient(135deg, var(--schedule-accent-warm), var(--schedule-accent-hot));
  box-shadow:
    6px 6px 0 var(--shadow-strong),
    0 12px 24px rgb(var(--ink-deep-rgb) / 0.2);
}

.fab:active {
  transform: scale(0.95);
}

.floating-panel {
  background: var(--surface-base);
  border: 2px solid var(--outline);
  border-radius: var(--radius-lg);
  padding: 0;
  width: 300px; /* Adjust as needed */
  max-width: calc(100vw - 48px);
  box-shadow:
    8px 8px 0 var(--shadow-strong),
    0 20px 40px rgb(var(--ink-deep-rgb) / 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: panel-pop 250ms var(--ease-out-back);
}

@keyframes panel-pop {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.floating-panel__header {
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--surface-sunlight), var(--surface-rose-soft));
  border-bottom: 2px dashed rgb(var(--outline-rgb) / 0.25);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.floating-panel__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  color: var(--ink);
}

.floating-panel__close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--ink-soft);
  padding: 4px;
  border-radius: 4px;
  display: flex;
}

.floating-panel__close:hover {
  background: rgb(var(--ink-deep-rgb) / 0.05);
  color: var(--ink);
}

.floating-panel__content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.floating-panel__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.floating-panel__section label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-soft);
  letter-spacing: 0.05em;
}

/* Dark Mode Overrides */
:root[data-theme='dark'] .fab {
  background: var(--surface-warm);
  border-color: var(--outline);
  box-shadow: var(--shadow-strong);
}

:root[data-theme='dark'] .fab:hover {
  background: var(--surface-warm-strong);
  border-color: var(--ink-soft);
}

:root[data-theme='dark'] .floating-panel {
  background: var(--surface-base);
  border-color: var(--outline);
  box-shadow: var(--shadow-strong);
}

:root[data-theme='dark'] .floating-panel__header {
  background: var(--surface-warm);
  border-bottom-style: solid;
  border-bottom-color: var(--outline);
}
</style>
