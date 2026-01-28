import type { TagType, TagMeta, ScheduleEvent, MemberTag, TypeTag, LiveRecordItem, LiveTypeMetadata } from '@/types/schedule'
import type { ScheduleApi } from './scheduleApi'
import type { WeekIdentifier } from './utils/scheduleUtils'
import { mockScheduleApi } from './mock/scheduleApi'
import { mockTagMeta, mockMemberTags, mockTypeTags, mockLiveRecords, mockLiveTypeMetadata } from './mock/scheduleData'
import { groupByWeek } from './utils/scheduleUtils'

// 默认使用mock API实现
let scheduleApi: ScheduleApi = mockScheduleApi

/**
 * 设置日程数据API实现
 * @param api API实现实例
 */
export function setScheduleApi(api: ScheduleApi) {
  scheduleApi = api
}

/**
 * 获取标签元数据
 */
export async function getTagMeta(): Promise<Record<TagType, TagMeta>> {
  return scheduleApi.getTagMeta()
}

/**
 * 获取成员标签列表
 */
export async function getMemberTags(): Promise<MemberTag[]> {
  return scheduleApi.getMemberTags()
}

/**
 * 获取类型标签列表
 */
export async function getTypeTags(): Promise<TypeTag[]> {
  return scheduleApi.getTypeTags()
}

/**
 * 获取直播类型元数据
 */
export async function getLiveTypeMetadata(): Promise<LiveTypeMetadata[]> {
  return scheduleApi.getLiveTypeMetadata()
}

/**
 * 获取直播记录列表
 */
export async function getLiveRecords(): Promise<LiveRecordItem[]> {
  return scheduleApi.getLiveRecords()
}

/**
 * 获取周计划
 */
export async function getWeeklyPlan(): Promise<Record<string, ScheduleEvent[]>> {
  return scheduleApi.getWeeklyPlan()
}

/**
 * 获取有数据的周列表
 */
export async function getAvailableWeeks(): Promise<WeekIdentifier[]> {
  return scheduleApi.getAvailableWeeks()
}

/**
 * 获取指定周的周计划
 */
export async function getWeeklyPlanByWeek(weekId: WeekIdentifier): Promise<Record<string, ScheduleEvent[]>> {
  return scheduleApi.getWeeklyPlanByWeek(weekId)
}

// 为了向后兼容，导出同步版本（使用mock数据）
export const tagMeta = mockTagMeta
export const memberTags = mockMemberTags
export const energyTags = mockTypeTags // 保持原有的energyTags命名以兼容旧代码
export const weeklyPlan = groupByWeek(mockLiveRecords)
export const liveTypeMetadata = mockLiveTypeMetadata

// 导出工具函数
export { liveTypeToTag, parseStartTime, getDayOfWeek, liveRecordToScheduleEvent, groupByWeek } from './utils/scheduleUtils'
