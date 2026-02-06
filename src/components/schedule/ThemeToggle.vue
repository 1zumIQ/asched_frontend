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
      <span class="theme-toggle__icon" aria-hidden="true">☀️</span>
      <span class="theme-toggle__label">
        <span class="theme-toggle__title">Cute</span>
        <span class="theme-toggle__hint">手绘可爱风</span>
      </span>
    </button>
    <button
      class="theme-toggle__button"
      :class="{ 'theme-toggle__button--active': theme === 'dark' }"
      data-theme="dark"
      type="button"
      @click="setTheme('dark')"
    >
      <span class="theme-toggle__icon" aria-hidden="true">🌑</span>
      <span class="theme-toggle__label">
        <span class="theme-toggle__title">Dark</span>
        <span class="theme-toggle__hint">简约暗色</span>
      </span>
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
  background: var(--surface-base);
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  cursor: pointer;
  transition: all 400ms var(--ease-out-back);
  box-shadow: 2px 2px 0 var(--shadow);
  position: relative;
  overflow: hidden;
}

.theme-toggle__button[data-theme='light'] {
  background: linear-gradient(135deg, var(--surface-base), var(--surface-warm));
  --theme-accent: var(--schedule-accent-warm);
}

.theme-toggle__button[data-theme='dark'] {
  background: var(--surface-warm);
  --theme-accent: var(--ink);
}

.theme-toggle__button:hover {
  transform: translate(-1px, -1px) scale(1.02);
  box-shadow: 3px 3px 0 var(--shadow-strong);
  z-index: 2;
}

.theme-toggle__button:active {
  transform: scale(0.95);
  transition: transform 100ms var(--ease-squish);
}

/* Light theme active - bouncy cute effect */
.theme-toggle__button[data-theme='light'].theme-toggle__button--active {
  border-color: var(--theme-accent);
  box-shadow:
    4px 4px 0 var(--shadow-strong),
    0 12px 20px var(--shadow-ambient-2);
  animation: cute-bounce 600ms ease-out;
}

/* Dark theme active - clean minimal effect */
.theme-toggle__button[data-theme='dark'].theme-toggle__button--active {
  border-color: var(--ink);
  background: var(--surface-warm-strong);
  box-shadow:
    0 4px 12px -2px rgba(0, 0, 0, 0.5),
    0 2px 4px -1px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

@keyframes cute-bounce {
  0% { transform: scale(0.95); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.theme-toggle__icon {
  font-size: 20px;
  position: relative;
  z-index: 1;
  transition: transform 300ms ease;
}

/* Light icon animation */
.theme-toggle__button[data-theme='light']:hover .theme-toggle__icon {
  transform: rotate(15deg) scale(1.1);
}

/* Dark icon animation - simple fade/scale */
.theme-toggle__button[data-theme='dark']:hover .theme-toggle__icon {
  transform: scale(1.1);
}

.theme-toggle__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  z-index: 1;
}

.theme-toggle__title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: var(--font-display);
}

.theme-toggle__hint {
  font-size: 10px;
  color: var(--ink-soft);
  font-weight: 600;
}

@media (max-width: 720px) {
  .theme-toggle {
    grid-template-columns: repeat(2, minmax(100px, 1fr));
  }

  .theme-toggle__button {
    padding: 8px 10px;
    gap: 8px;
  }

  .theme-toggle__icon {
    font-size: 18px;
  }
}
</style>
