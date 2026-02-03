import type { ApiLiveTag, ApiLiveTagMeta, ApiUser } from '@/data/schedule'
import type { LiveTypeTagMap } from '@/data/utils/liveRecord'
import type { TagMeta, TagType } from '@/types/ui'

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

const FALLBACK_META: TagMeta = {
  label: 'Unknown',
  color: '#5a4d43',
  tint: '#f0e9e2',
}

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

export function buildMemberTagMeta(users: ApiUser[]) {
  const sorted = [...users].sort((a, b) => a.mid - b.mid)
  const tagMeta: Record<TagType, TagMeta> = {}
  const memberTags = sorted.map((user) => user.name)

  sorted.forEach((user, index) => {
    const palette = getPaletteEntry(memberPalette, index)
    tagMeta[user.name] = {
      label: user.name,
      color: palette.color,
      tint: palette.tint,
      avatar: user.face_url_bili || undefined,
    }
  })

  return { memberTags, tagMeta }
}

export function buildTypeTagMeta(liveTags: ApiLiveTag[], liveTagMeta: ApiLiveTagMeta[]) {
  const metaById = new Map<number, ApiLiveTagMeta>()
  liveTagMeta.forEach((meta) => {
    metaById.set(meta.tag_id, meta)
  })

  const active = liveTags.filter(tag => tag.is_active !== false)
  const sorted = [...active].sort((a, b) => {
    const orderA = a.sort_order ?? 0
    const orderB = b.sort_order ?? 0
    if (orderA !== orderB) return orderA - orderB
    return a.tag_id - b.tag_id
  })

  const tagMeta: Record<TagType, TagMeta> = {}
  const typeTags: string[] = []
  const typeTagMap: LiveTypeTagMap = new Map()

  sorted.forEach((tag, index) => {
    const meta = metaById.get(tag.tag_id)
    const palette = getPaletteEntry(typePalette, index)
    const metaColor = normalizeHex(meta?.color ?? null)
    const color = metaColor ?? palette.color
    const tint = metaColor ? makeTint(metaColor, palette.tint) : palette.tint

    tagMeta[tag.name] = {
      label: tag.name,
      color,
      tint,
      icon: meta?.icon ?? undefined,
    }

    typeTags.push(tag.name)
    typeTagMap.set(tag.tag_id, tag.name)
  })

  return { typeTags, tagMeta, typeTagMap }
}

export function buildFallbackTagMeta(tag: string): TagMeta {
  return { ...FALLBACK_META, label: tag }
}
