import type { ScheduleApi } from '../scheduleApi'
import type { ApiIsoWeek, ApiLiveRecord } from '../schedule'
import { compareIsoWeeks, getCurrentIsoWeek, getIsoWeekFromDate, getIsoWeekKey } from '../utils/isoWeek'
import { getRecordStartDate } from '../records'
import { mockLiveRecords, mockLiveTagMeta, mockLiveTags, mockVupMeta, mockVups } from './scheduleData'

/**
 * Mock实现的日程数据API
  */
export class MockScheduleApi implements ScheduleApi {
  // 模拟有数据的周列表（可按需添加）
  private availableWeeks: ApiIsoWeek[] = [
    { year: 2026, week: 4 },
    { year: 2025, week: 52 },
    { year: 2025, week: 51 },
    { year: 2025, week: 50 },
    { year: 2025, week: 49 },
    { year: 2025, week: 48 },
    { year: 2025, week: 47 },
  ]

  async getVups() {
    return mockVups
  }

  async getVupMeta() {
    return mockVupMeta
  }

  async getLiveTags() {
    return mockLiveTags
  }

  async getLiveTagMeta() {
    return mockLiveTagMeta
  }

  async getAvailableWeeks() {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100))
    const currentWeek = getCurrentIsoWeek()
    const autoWeeks = mockLiveRecords
      .map(record => {
        const date = getRecordStartDate(record)
        if (!date) return null
        return getIsoWeekFromDate(date)
      })
      .filter((week): week is ApiIsoWeek => Boolean(week))

    const merged = new Map<string, IsoWeek>()
    ;[currentWeek, ...autoWeeks, ...this.availableWeeks].forEach((week) => {
      merged.set(getIsoWeekKey(week), week)
    })

    return [...merged.values()].sort(compareIsoWeeks)
  }

  async getLiveRecordsByWeek(week: ApiIsoWeek): Promise<ApiLiveRecord[]> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 150))

    const recordsForWeek = mockLiveRecords.filter((record) => {
      const date = getRecordStartDate(record)
      if (!date) return false
      const recordWeek = getIsoWeekFromDate(date)
      return recordWeek.year === week.year && recordWeek.week === week.week
    })

    return recordsForWeek
  }
}

// 导出单例实例
export const mockScheduleApi = new MockScheduleApi()
