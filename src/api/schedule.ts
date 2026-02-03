import type { components } from '@/types/schema'
import { apiClient } from './client'

export type ApiLiveRecord = components['schemas']['LiveRecordDto']
export type ApiIsoWeek = components['schemas']['IsoWeekTz']
export type ApiVup = components['schemas']['VupDto']
export type ApiVupMeta = components['schemas']['VupMetaDto']
export type ApiLiveTag = components['schemas']['LiveTagDto']
export type ApiLiveTagMeta = components['schemas']['LiveTagMetaDto']

let vupsCache: Promise<ApiVup[]> | null = null
let vupMetaCache: Promise<ApiVupMeta[]> | null = null
let liveTagsCache: Promise<ApiLiveTag[]> | null = null
let liveTagMetaCache: Promise<ApiLiveTagMeta[]> | null = null

export async function getVups(): Promise<ApiVup[]> {
  if (!vupsCache) {
    vupsCache = apiClient
      .GET('/api/v1/vup')
      .then(({ data, error }) => {
        if (error) {
          throw new Error('Failed to fetch vups')
        }
        return data ?? []
      })
  }
  return vupsCache
}

export async function getVupMeta(): Promise<ApiVupMeta[]> {
  if (!vupMetaCache) {
    vupMetaCache = apiClient
      .GET('/api/v1/vup_meta')
      .then(({ data, error }) => {
        if (error) {
          throw new Error('Failed to fetch vup meta')
        }
        return data ?? []
      })
  }
  return vupMetaCache
}

export async function getLiveTags(): Promise<ApiLiveTag[]> {
  if (!liveTagsCache) {
    liveTagsCache = apiClient
      .GET('/api/v1/live_tag')
      .then(({ data, error }) => {
        if (error) {
          throw new Error('Failed to fetch live tags')
        }
        return data ?? []
      })
  }
  return liveTagsCache
}

export async function getLiveTagMeta(): Promise<ApiLiveTagMeta[]> {
  if (!liveTagMetaCache) {
    liveTagMetaCache = apiClient
      .GET('/api/v1/live_tag_meta')
      .then(({ data, error }) => {
        if (error) {
          throw new Error('Failed to fetch live tag meta')
        }
        return data ?? []
      })
  }
  return liveTagMetaCache
}

export async function getAvailableWeeks(): Promise<ApiIsoWeek[]> {
  const { data, error } = await apiClient.GET('/api/v1/live_records/available_weeks')
  if (error) {
    throw new Error('Failed to fetch available weeks')
  }
  return data ?? []
}

export async function getLiveRecordsByWeek(week: ApiIsoWeek): Promise<ApiLiveRecord[]> {
  const { data, error } = await apiClient.GET('/api/v1/live_records/all/{year}/{week}', {
    params: {
      path: {
        year: week.year,
        week: week.week,
      },
    },
  })

  if (error) {
    throw new Error(`Failed to fetch live records for ${week.year}-W${week.week}`)
  }

  return data ?? []
}
