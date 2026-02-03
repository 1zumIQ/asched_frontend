// UI related types (dynamic, derived from API data)
export type MemberId = number
export type LiveTypeId = number

export type MemberTag = `member:${MemberId}`
export type TypeTag = `type:${LiveTypeId}`
export type TagType = MemberTag | TypeTag

export type LiveType = LiveTypeId
export type LiveStatus = number

export type TagKind = 'member' | 'type'

export type TagMeta = {
  id: number
  kind: TagKind
  label: string
  color: string
  tint: string
  avatar?: string
  icon?: string
}

export type ThemeName = 'sunrise' | 'ocean'

export type DayCard<TEvent = unknown> = {
  longName: string
  shortName: string
  numeric: string
  isToday: boolean
  events: TEvent[]
}
