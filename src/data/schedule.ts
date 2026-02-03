import type { ScheduleEvent, LiveTypeMetadata, MemberTag, TagMeta, TagType, TypeTag } from '@/types/schedule'
import type { ScheduleApi } from './scheduleApi'
import type { WeekIdentifier } from './utils/scheduleUtils'
import { mockScheduleApi } from './mock/scheduleApi'

const scheduleApi: ScheduleApi = mockScheduleApi

export async function getTagMeta(): Promise<Record<TagType, TagMeta>> {
  return scheduleApi.getTagMeta()
}

export async function getMemberTags(): Promise<MemberTag[]> {
  return scheduleApi.getMemberTags()
}

export async function getTypeTags(): Promise<TypeTag[]> {
  return scheduleApi.getTypeTags()
}

export async function getLiveTypeMetadata(): Promise<LiveTypeMetadata[]> {
  return scheduleApi.getLiveTypeMetadata()
}

export async function getAvailableWeeks(): Promise<WeekIdentifier[]> {
  return scheduleApi.getAvailableWeeks()
}

export async function getWeeklyPlanByWeek(
  weekId: WeekIdentifier
): Promise<Record<string, ScheduleEvent[]>> {
  return scheduleApi.getWeeklyPlanByWeek(weekId)
}
