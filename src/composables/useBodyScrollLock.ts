import { onBeforeUnmount, watch, type Ref } from 'vue'

export function useBodyScrollLock(isLocked: Ref<boolean>) {
  const applyLock = (locked: boolean) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = locked ? 'hidden' : ''
  }

  watch(isLocked, applyLock, { flush: 'sync' })

  onBeforeUnmount(() => {
    applyLock(false)
  })
}
