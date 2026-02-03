import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getLiveTagMeta,
  getLiveTags,
  getVupMeta,
  getVups,
  type ApiLiveTag,
  type ApiLiveTagMeta,
  type ApiVup,
  type ApiVupMeta,
} from '@/data/schedule'
import type { MemberTag, TagMeta, TagType, TypeTag } from '@/types/ui'
import { toMemberTag, toTypeTag } from '@/data/tagKeys'

const memberPalette = [
  { color: '#ff6b6b', tint: '#ffe5e5' },
  { color: '#4d96ff', tint: '#e2eeff' },
  { color: '#06d6a0', tint: '#dffaf0' },
  { color: '#ffd166', tint: '#fff2b3' },
  { color: '#ff4fa3', tint: '#ffe0f0' },
  { color: '#9ee65c', tint: '#effbe3' },
  { color: '#845ef7', tint: '#eee6ff' },
  { color: '#f59e0b', tint: '#ffedd5' },
]

const typePalette = [
  { color: '#ff8a5b', tint: '#ffe5d8' },
  { color: '#4cc9f0', tint: '#e0f7ff' },
  { color: '#f15bb5', tint: '#ffe0f0' },
  { color: '#43aa8b', tint: '#dcf5ee' },
  { color: '#f9c74f', tint: '#fff3cf' },
  { color: '#9b5de5', tint: '#efe4ff' },
]

function normalizeHex(color?: string | null): string | null {
  if (!color) return null
  const trimmed = color.trim()
  if (!trimmed.startsWith('#')) return null
  if (trimmed.length === 4 || trimmed.length === 7) return trimmed.toLowerCase()
  return null
}

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = normalizeHex(hex)
  if (!normalized) return null
  const raw = normalized.length === 4
    ? normalized.slice(1).split('').map((c) => c + c).join('')
    : normalized.slice(1)
  const r = parseInt(raw.slice(0, 2), 16)
  const g = parseInt(raw.slice(2, 4), 16)
  const b = parseInt(raw.slice(4, 6), 16)
  if ([r, g, b].some(Number.isNaN)) return null
  return [r, g, b]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function makeTint(color: string, fallback: string): string {
  const rgb = hexToRgb(color)
  if (!rgb) return fallback
  const [r, g, b] = rgb
  const mix = (value: number) => Math.round(value + (255 - value) * 0.82)
  return rgbToHex([mix(r), mix(g), mix(b)])
}

function getPaletteEntry<T extends { color: string; tint: string }>(palette: T[], index: number): T {
  return palette[index % palette.length]
}

export const useScheduleMetaStore = defineStore('scheduleMeta', () => {
  const vups = ref<ApiVup[]>([])
  const vupMeta = ref<ApiVupMeta[]>([])
  const liveTags = ref<ApiLiveTag[]>([])
  const liveTagMeta = ref<ApiLiveTagMeta[]>([])
  const isLoading = ref(false)
  const error = ref<unknown | null>(null)
  const hasLoaded = ref(false)

  const vupMetaByMid = computed(() => {
    const map = new Map<number, ApiVupMeta>()
    vupMeta.value.forEach((meta) => {
      map.set(meta.mid, meta)
    })
    return map
  })

  const liveTagMetaById = computed(() => {
    const map = new Map<number, ApiLiveTagMeta>()
    liveTagMeta.value.forEach((meta) => {
      map.set(meta.tag_id, meta)
    })
    return map
  })

  const sortedVups = computed(() => [...vups.value].sort((a, b) => a.mid - b.mid))

  const sortedLiveTags = computed(() => {
    const active = liveTags.value.filter(tag => tag.is_active !== false)
    return [...active].sort((a, b) => {
      const orderA = a.sort_order ?? 0
      const orderB = b.sort_order ?? 0
      if (orderA !== orderB) return orderA - orderB
      return a.tag_id - b.tag_id
    })
  })

  const memberTags = computed<MemberTag[]>(() => {
    return sortedVups.value.map(vup => toMemberTag(vup.mid))
  })

  const typeTags = computed<TypeTag[]>(() => {
    return sortedLiveTags.value.map(tag => toTypeTag(tag.tag_id))
  })

  const tagMeta = computed<Record<TagType, TagMeta>>(() => {
    const meta: Record<TagType, TagMeta> = {}

    sortedVups.value.forEach((vup, index) => {
      const palette = getPaletteEntry(memberPalette, index)
      const configuredColor = normalizeHex(vupMetaByMid.value.get(vup.mid)?.color ?? null)
      const color = configuredColor ?? palette.color
      const tint = configuredColor ? makeTint(configuredColor, palette.tint) : palette.tint

      meta[toMemberTag(vup.mid)] = {
        id: vup.mid,
        kind: 'member',
        label: vup.name,
        color,
        tint,
        avatar: vup.face_url_bili || undefined,
      }
    })

    sortedLiveTags.value.forEach((tag, index) => {
      const palette = getPaletteEntry(typePalette, index)
      const configuredColor = normalizeHex(liveTagMetaById.value.get(tag.tag_id)?.color ?? null)
      const color = configuredColor ?? palette.color
      const tint = configuredColor ? makeTint(configuredColor, palette.tint) : palette.tint
      const icon = liveTagMetaById.value.get(tag.tag_id)?.icon ?? undefined

      meta[toTypeTag(tag.tag_id)] = {
        id: tag.tag_id,
        kind: 'type',
        label: tag.name,
        color,
        tint,
        icon: icon ?? undefined,
      }
    })

    return meta
  })

  async function load() {
    if (isLoading.value || hasLoaded.value) return
    isLoading.value = true
    error.value = null
    try {
      const [vupData, vupMetaData, liveTagData, liveTagMetaData] = await Promise.all([
        getVups(),
        getVupMeta(),
        getLiveTags(),
        getLiveTagMeta(),
      ])
      vups.value = vupData
      vupMeta.value = vupMetaData
      liveTags.value = liveTagData
      liveTagMeta.value = liveTagMetaData
      hasLoaded.value = true
    } catch (err) {
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    vups,
    vupMeta,
    liveTags,
    liveTagMeta,
    memberTags,
    typeTags,
    tagMeta,
    isLoading,
    error,
    load,
  }
})
