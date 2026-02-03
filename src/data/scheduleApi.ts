import type { ScheduleEvent, LiveTypeMetadata, MemberTag, TagMeta, TagType, TypeTag } from '@/types/schedule'
import type { WeekIdentifier } from './utils/scheduleUtils'

export interface ScheduleApi {
  getTagMeta(): Promise<Record<TagType, TagMeta>>
  getMemberTags(): Promise<MemberTag[]>
  getTypeTags(): Promise<TypeTag[]>
  getLiveTypeMetadata(): Promise<LiveTypeMetadata[]>
  getAvailableWeeks(): Promise<WeekIdentifier[]>
  getWeeklyPlanByWeek(weekId: WeekIdentifier): Promise<Record<string, ScheduleEvent[]>>
}
