import type { components } from '@/types/schema'
import { apiClient } from './apiClient'

export type ApiLiveRecord = components['schemas']['LiveRecordDto']
export type ApiIsoWeek = components['schemas']['IsoWeekTz']
export type ApiUser = components['schemas']['VupDto']
export type ApiLiveTag = components['schemas']['LiveTagDto']
export type ApiLiveTagMeta = components['schemas']['LiveTagMetaDto']

let usersCache: Promise<ApiUser[]> | null = null
let liveTagsCache: Promise<ApiLiveTag[]> | null = null
let liveTagMetaCache: Promise<ApiLiveTagMeta[]> | null = null

export async function getUsers(): Promise<ApiUser[]> {
  if (!usersCache) {
    usersCache = apiClient
      .GET('/api/v1/users')
      .then(({ data, error }) => {
        if (error) {
          throw new Error('Failed to fetch users')
        }
        return data ?? []
      })
  }
  return usersCache
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

export async function getWeeklyPlanByWeek(week: ApiIsoWeek): Promise<ApiLiveRecord[]> {
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
