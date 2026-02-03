import type { ApiIsoWeek, ApiLiveRecord, ApiLiveTag, ApiLiveTagMeta, ApiVup, ApiVupMeta } from './schedule'

export interface ScheduleApi {
  getVups(): Promise<ApiVup[]>
  getVupMeta(): Promise<ApiVupMeta[]>
  getLiveTags(): Promise<ApiLiveTag[]>
  getLiveTagMeta(): Promise<ApiLiveTagMeta[]>
  getAvailableWeeks(): Promise<ApiIsoWeek[]>
  getLiveRecordsByWeek(week: ApiIsoWeek): Promise<ApiLiveRecord[]>
}

