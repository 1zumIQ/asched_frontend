// 成员标签
export type MemberTag = '思诺' | '心宜' | '贝拉' | '乃琳' | '嘉然' | 'A-SOUL' | '二期团播'
// 类型标签
export type TypeTag = '日常' | '2D' | '节目'

export type TagType = MemberTag | TypeTag

export type ScheduleEvent = {
  time: string
  title: string
  location?: string
  note?: string
  tags: TagType[]
}

export type TagMeta = {
  label: string
  color: string
  tint: string
  avatar?: string
}

export type DayCard = {
  longName: string
  shortName: string
  numeric: string
  isToday: boolean
  events: ScheduleEvent[]
}
