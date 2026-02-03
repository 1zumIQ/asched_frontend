import type { components } from '@/types/schema'
import type { LiveStatus, LiveType, ScheduleEvent, TagType } from '@/types/ui'
import type { MemberIndex } from './memberMap'
import { resolveMemberName, resolveMemberNames } from './memberMap'

type ApiLiveRecord = components['schemas']['LiveRecordDto']

type ScheduleEventWithDate = ScheduleEvent & {
  startDate: Date
}

export type LiveTypeTagMap = Map<number, string>

export function getRecordStartDate(record: ApiLiveRecord): Date | null {
  const date = new Date(record.start_time)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function getRecordMemberTags(record: ApiLiveRecord, members?: MemberIndex): string[] {
  const host = resolveMemberName(record.mid, members)
  const guests = resolveMemberNames(record.guest_mids, members).filter(tag => tag !== host)
  return [host, ...guests]
}

export function resolveTypeTag(liveType: LiveType, typeTags: LiveTypeTagMap): string {
  return typeTags.get(liveType) ?? `类型 ${liveType}`
}

export function toScheduleEvent(
  record: ApiLiveRecord,
  members: MemberIndex | undefined,
  typeTags: LiveTypeTagMap
): ScheduleEventWithDate | null {
  const startDate = getRecordStartDate(record)
  if (!startDate) return null

  const name = resolveMemberName(record.mid, members)
  const guests = resolveMemberNames(record.guest_mids, members).filter(tag => tag !== name)
  const typeTag = resolveTypeTag(record.live_type as LiveType, typeTags)

  const event: ScheduleEventWithDate = {
    time: formatTime(startDate),
    title: record.title,
    tags: [name, ...guests, typeTag] as TagType[],
    name,
    guests,
    liveType: record.live_type as LiveType,
    startTime: record.start_time,
    endTime: record.end_time ?? undefined,
    status: record.status as LiveStatus,
    startDate,
  }

  return event
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString()
}

export type { ApiLiveRecord, ScheduleEventWithDate }
