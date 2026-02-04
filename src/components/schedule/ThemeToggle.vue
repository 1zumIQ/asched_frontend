<script setup lang="ts">
import type { ThemeName } from '@/types/ui'

const { theme } = defineProps<{
  theme: ThemeName
}>()

const emit = defineEmits<{
  'update:theme': [theme: ThemeName]
}>()

const setTheme = (value: ThemeName) => {
  emit('update:theme', value)
}
</script>

<template>
  <div class="theme-toggle" role="group" aria-label="选择主题">
    <button
      class="theme-toggle__button"
      :class="{ 'theme-toggle__button--active': theme === 'light' }"
      data-theme="light"
      type="button"
      @click="setTheme('light')"
    >
      <span class="theme-toggle__title">Light</span>
      <span class="theme-toggle__hint">Default</span>
    </button>
    <button
      class="theme-toggle__button"
      :class="{ 'theme-toggle__button--active': theme === 'dark' }"
      data-theme="dark"
      type="button"
      @click="setTheme('dark')"
    >
      <span class="theme-toggle__title">Dark</span>
      <span class="theme-toggle__hint">Night</span>
    </button>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 10px;
}

.theme-toggle__button {
  border-radius: var(--radius-md);
  border: 2px solid var(--outline);
  padding: 10px 12px;
  background: linear-gradient(135deg, var(--surface-base), var(--surface-warm));
  color: var(--ink);
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 2px 2px 0 var(--shadow);
  position: relative;
  overflow: hidden;
}

.theme-toggle__button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--theme-accent-soft), transparent);
  opacity: 0.4;
  transition: opacity 200ms ease;
}

.theme-toggle__button[data-theme='light'] {
  --theme-accent: var(--schedule-accent-warm);
  --theme-accent-soft: var(--surface-warm-strong);
}

.theme-toggle__button[data-theme='dark'] {
  --theme-accent: var(--schedule-accent-cool);
  --theme-accent-soft: var(--surface-cool);
}

.theme-toggle__button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--shadow-strong);
}

.theme-toggle__button:hover::before {
  opacity: 0.7;
}

.theme-toggle__button--active {
  border-color: var(--theme-accent);
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    0 12px 20px var(--shadow-ambient-2);
}

.theme-toggle__button--active::before {
  opacity: 0.85;
}

.theme-toggle__title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: var(--font-display);
  position: relative;
  z-index: 1;
}

.theme-toggle__hint {
  font-size: 11px;
  color: var(--ink-soft);
  font-weight: 600;
  position: relative;
  z-index: 1;
}

@media (max-width: 720px) {
  .theme-toggle {
    grid-template-columns: repeat(2, minmax(100px, 1fr));
  }

  .theme-toggle__button {
    padding: 8px 10px;
  }
}
</style>
