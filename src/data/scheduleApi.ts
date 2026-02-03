import type { ApiLiveRecord, ApiLiveTag, ApiLiveTagMeta, ApiUser } from './schedule'
import type { IsoWeek } from './utils/isoWeek'

export interface ScheduleApi {
  getUsers(): Promise<ApiUser[]>
  getLiveTags(): Promise<ApiLiveTag[]>
  getLiveTagMeta(): Promise<ApiLiveTagMeta[]>
  getAvailableWeeks(): Promise<IsoWeek[]>
  getWeeklyPlanByWeek(week: IsoWeek): Promise<ApiLiveRecord[]>
}

