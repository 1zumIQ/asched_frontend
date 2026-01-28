import type { TagType, TagMeta, ScheduleEvent, MemberTag, TypeTag, LiveRecordItem, LiveTypeMetadata } from '@/types/schedule'
import type { WeekIdentifier } from './utils/scheduleUtils'

/**
 * 日程数据API接口
 */
export interface ScheduleApi {
  /**
   * 获取标签元数据
   */
  getTagMeta(): Promise<Record<TagType, TagMeta>>

  /**
   * 获取成员标签列表
   */
  getMemberTags(): Promise<MemberTag[]>

  /**
   * 获取类型标签列表
   */
  getTypeTags(): Promise<TypeTag[]>

  /**
   * 获取直播类型元数据（包含图标、颜色等）
   */
  getLiveTypeMetadata(): Promise<LiveTypeMetadata[]>

  /**
   * 获取直播记录列表
   */
  getLiveRecords(): Promise<LiveRecordItem[]>

  /**
   * 获取周计划（按星期分组的日程事件）
   */
  getWeeklyPlan(): Promise<Record<string, ScheduleEvent[]>>

  /**
   * 获取有数据的周列表
   */
  getAvailableWeeks(): Promise<WeekIdentifier[]>

  /**
   * 获取指定周的周计划
   */
  getWeeklyPlanByWeek(weekId: WeekIdentifier): Promise<Record<string, ScheduleEvent[]>>
}
