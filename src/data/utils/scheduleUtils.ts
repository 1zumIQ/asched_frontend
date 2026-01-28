import type { LiveRecordItem, ScheduleEvent, LiveType, TypeTag } from '@/types/schedule'

/**
 * 周标识符类型 "YYYY-WW" 格式
 */
export type WeekIdentifier = string

/**
 * 获取ISO周数（ISO 8601标准）
 * ISO周从周一开始，第一周是包含1月4日的那一周
 */
export function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf())
  const dayNr = (date.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
}

/**
 * 获取ISO周年份
 */
export function getISOWeekYear(date: Date): number {
  const target = new Date(date.valueOf())
  target.setDate(target.getDate() + 3 - (target.getDay() + 6) % 7)
  return target.getFullYear()
}

/**
 * 获取周标识符 "YYYY-WW" 格式
 */
export function getWeekIdentifier(date: Date): WeekIdentifier {
  const year = getISOWeekYear(date)
  const week = getISOWeek(date)
  return `${year}-${week.toString().padStart(2, '0')}`
}

/**
 * 从周标识符获取该周的周一日期
 */
export function getWeekStartDate(weekId: WeekIdentifier): Date {
  const [yearStr, weekStr] = weekId.split('-')
  const year = parseInt(yearStr, 10)
  const week = parseInt(weekStr, 10)

  // 找到该年第一周的周四
  const jan4 = new Date(year, 0, 4)
  const firstThursday = new Date(jan4)
  const dayOfWeek = (jan4.getDay() + 6) % 7
  firstThursday.setDate(jan4.getDate() - dayOfWeek + 3)

  // 计算目标周的周一
  const targetMonday = new Date(firstThursday)
  targetMonday.setDate(firstThursday.getDate() - 3 + (week - 1) * 7)
  targetMonday.setHours(0, 0, 0, 0)

  return targetMonday
}

/**
 * 获取当前周标识符
 */
export function getCurrentWeekIdentifier(): WeekIdentifier {
  return getWeekIdentifier(new Date())
}

/**
 * 获取上一周标识符
 */
export function getPreviousWeekIdentifier(weekId: WeekIdentifier): WeekIdentifier {
  const monday = getWeekStartDate(weekId)
  monday.setDate(monday.getDate() - 7)
  return getWeekIdentifier(monday)
}

/**
 * 获取下一周标识符
 */
export function getNextWeekIdentifier(weekId: WeekIdentifier): WeekIdentifier {
  const monday = getWeekStartDate(weekId)
  monday.setDate(monday.getDate() + 7)
  return getWeekIdentifier(monday)
}

/**
 * 格式化周标识符为显示文本
 */
export function formatWeekIdentifier(weekId: WeekIdentifier): string {
  const [year, week] = weekId.split('-')
  return `${year}年第${parseInt(week, 10)}周`
}

/**
 * 将LiveType枚举转换为TypeTag字符串
 */
export function liveTypeToTag(liveType: LiveType): TypeTag {
  const typeMap: Record<LiveType, TypeTag> = {
    0: '其它',
    1: '2D',
    2: '节目',
    3: '日常',
    4: '突击',
    5: '推广',
    6: '电台',
    7: '特别',
    8: '枝江综艺'
  }
  return typeMap[liveType]
}

/**
 * 解析时间字符串 "YY-MM-DD HH:MM" 为Date对象
 */
export function parseStartTime(startTime: string): Date {
  // 格式: "26-01-28 19:30"
  const [datePart, timePart] = startTime.split(' ')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  // 假设年份是20xx年
  const fullYear = 2000 + year
  return new Date(fullYear, month - 1, day, hour, minute)
}

/**
 * 获取星期几的英文名称
 */
export function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

/**
 * 将LiveRecordItem转换为ScheduleEvent
 */
export function liveRecordToScheduleEvent(record: LiveRecordItem): ScheduleEvent {
  const date = parseStartTime(record.start_time)
  const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

  // 构建tags数组: [name, ...guests, typeTag]
  const tags = [
    record.name,
    ...record.guests,
    liveTypeToTag(record.type)
  ]

  return {
    time,
    title: record.title,
    tags,
    name: record.name,
    guests: record.guests,
    liveType: record.type,
    startTime: record.start_time,
    endTime: record.end_time,
    status: record.status
  }
}

/**
 * 将LiveRecordItem数组按星期分组
 */
export function groupByWeek(records: LiveRecordItem[]): Record<string, ScheduleEvent[]> {
  const grouped: Record<string, ScheduleEvent[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  }

  for (const record of records) {
    const date = parseStartTime(record.start_time)
    const dayOfWeek = getDayOfWeek(date)
    const event = liveRecordToScheduleEvent(record)
    grouped[dayOfWeek].push(event)
  }

  // 按时间排序每一天的事件
  for (const day in grouped) {
    grouped[day].sort((a, b) => a.time.localeCompare(b.time))
  }

  return grouped
}
