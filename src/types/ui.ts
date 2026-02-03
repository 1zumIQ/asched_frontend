// UI related types (dynamic, derived from API data)
export type MemberTag = string
export type TypeTag = string
export type TagType = string
export type LiveType = number
export type LiveStatus = number

export type LiveTypeMetadata = {
  id: LiveType
  name: string
  icon?: string
  color?: string
  description?: string
}

export type LiveRecordItem = {
  name: string
  title: string
  guests: string[]
  type: LiveType
  start_time: string
  end_time?: string
  status: LiveStatus
}

export type ScheduleEvent = {
  time: string
  title: string
  location?: string
  note?: string
  tags: TagType[]
  name: string
  guests: string[]
  liveType: LiveType
  startTime: string
  endTime?: string
  status: LiveStatus
}

export type TagMeta = {
  label: string
  color: string
  tint: string
  avatar?: string
  icon?: string
}

export type DayCard = {
  longName: string
  shortName: string
  numeric: string
  isToday: boolean
  events: ScheduleEvent[]
}
