import type { ScheduleApi } from '../scheduleApi'
import type { WeekIdentifier } from '../utils/scheduleUtils'
import { mockTagMeta, mockMemberTags, mockTypeTags, mockLiveRecords, mockLiveTypeMetadata } from './scheduleData'
import { groupByWeek, getWeekIdentifier, parseStartTime, getWeekStartDate, getDayOfWeek } from '../utils/scheduleUtils'
import type { LiveRecordItem, ScheduleEvent, LiveStatus } from '@/types/schedule'

/**
 * Mock实现的日程数据API
 */
export class MockScheduleApi implements ScheduleApi {
  // 模拟有数据的周列表（可以根据需要添加更多周）
  private availableWeeks: WeekIdentifier[] = [
    '2026-05', // 2026年第5周（当前周，包含1月28日）
    '2026-04', // 2026年第4周
    '2025-52', // 2025年第52周
    '2025-51', // 2025年第51周
  ]

  async getTagMeta() {
    return mockTagMeta
  }

  async getMemberTags() {
    return mockMemberTags
  }

  async getTypeTags() {
    return mockTypeTags
  }

  async getLiveTypeMetadata() {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 50))
    return mockLiveTypeMetadata
  }

  async getLiveRecords() {
    return mockLiveRecords
  }

  async getWeeklyPlan() {
    return groupByWeek(mockLiveRecords)
  }

  async getAvailableWeeks() {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...this.availableWeeks]
  }

  async getWeeklyPlanByWeek(weekId: WeekIdentifier) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 150))

    // 如果请求的是当前周（2026-05），返回mock数据
    if (weekId === '2026-05') {
      return groupByWeek(mockLiveRecords)
    }

    // 获取该周的周一日期
    const weekStart = getWeekStartDate(weekId)

    // 为其他周生成一些示例数据
    const records: LiveRecordItem[] = []

    // 根据周数生成不同的数据
    const [year, week] = weekId.split('-').map(Number)
    const seed = year * 100 + week

    // 生成2-5个随机事件
    const eventCount = 2 + (seed % 4)

    for (let i = 0; i < eventCount; i++) {
      const dayOffset = (seed + i * 3) % 7 // 随机选择星期几
      const eventDate = new Date(weekStart)
      eventDate.setDate(weekStart.getDate() + dayOffset)

      const hour = 19 + (seed + i) % 3 // 19:00, 20:00, 21:00
      const minute = (i * 15) % 60

      const members = ['思诺', '心宜', '贝拉', '乃琳', '嘉然']
      const member = members[(seed + i) % members.length]

      const types = [1, 2, 3, 4] // 2D, 节目, 日常, 突击
      const type = types[(seed + i * 2) % types.length]

      const titles = [
        '直播唱歌',
        '游戏时间',
        '闲聊互动',
        '特别企划',
        '周年庆典'
      ]
      const title = titles[(seed + i) % titles.length]

      // 历史周的数据标记为已结束
      const isPastWeek = weekId < '2026-05'
      const status: LiveStatus = isPastWeek ? 1 : 3 // 1=已结束, 3=未开始

      const startTime = `${eventDate.getFullYear().toString().slice(-2)}-${(eventDate.getMonth() + 1).toString().padStart(2, '0')}-${eventDate.getDate().toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

      const record: LiveRecordItem = {
        name: member,
        title: `${member}的${title}`,
        guests: [],
        type,
        start_time: startTime,
        status
      }

      // 如果是已结束的直播，添加end_time
      if (isPastWeek) {
        const endHour = hour + 2
        record.end_time = `${eventDate.getFullYear().toString().slice(-2)}-${(eventDate.getMonth() + 1).toString().padStart(2, '0')}-${eventDate.getDate().toString().padStart(2, '0')} ${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      }

      records.push(record)
    }

    return groupByWeek(records)
  }
}

// 导出单例实例
export const mockScheduleApi = new MockScheduleApi()
