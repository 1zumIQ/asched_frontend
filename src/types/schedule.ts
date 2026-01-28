// 成员标签
export type MemberTag = '思诺' | '心宜' | '贝拉' | '乃琳' | '嘉然' | '珈乐' | '向晚' | 'A-SOUL'

// 直播类型枚举
export enum LiveType {
  其它 = 0,
  '2D' = 1,
  节目 = 2,
  日常 = 3,
  突击 = 4,
  推广 = 5,
  电台 = 6,
  特别 = 7,
  枝江综艺 = 8
}

// 直播状态枚举
export enum LiveStatus {
  直播中 = 0,
  已结束 = 1,
  中断 = 2,
  未开始 = 3,
  迟到 = 4
}

// 类型标签（用于UI显示）
export type TypeTag = '其它' | '2D' | '节目' | '日常' | '突击' | '推广' | '电台' | '特别' | '枝江综艺'

export type TagType = MemberTag | TypeTag

// 直播类型元数据（从后端获取）
export type LiveTypeMetadata = {
  id: LiveType
  name: string
  icon: string // emoji图标
  color: string
  description?: string
}

// 直播记录项（对应后端LiveRecordItem）
export type LiveRecordItem = {
  name: string
  title: string
  guests: string[]
  type: LiveType
  start_time: string // 格式: "YY-MM-DD HH:MM"
  end_time?: string // 格式: "YY-MM-DD HH:MM"，历史直播会有此字段
  status: LiveStatus // 0=直播中, 1=已结束, 2=中断, 3=未开始, 4=迟到
}

// 日程事件（用于UI显示，从LiveRecordItem转换而来）
export type ScheduleEvent = {
  time: string
  title: string
  location?: string
  note?: string
  tags: TagType[]
  // 新增字段
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
}

export type DayCard = {
  longName: string
  shortName: string
  numeric: string
  isToday: boolean
  events: ScheduleEvent[]
}
