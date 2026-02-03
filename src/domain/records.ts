import type { ApiLiveRecord } from '@/api/schedule'
import type { MemberTag, TagType, TypeTag } from '@/types/ui'
import { toMemberTag, toTypeTag } from './tagKeys'

export type LiveRecordView = {
  record: ApiLiveRecord
  startDate: Date
  timeLabel: string
  memberTags: MemberTag[]
  typeTag: TypeTag
  tagKeys: TagType[]
}

export function getRecordStartDate(record: ApiLiveRecord): Date | null {
  const date = new Date(record.start_time)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function formatTimeLabel(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function getRecordMemberTags(record: ApiLiveRecord): MemberTag[] {
  const tags = [toMemberTag(record.mid), ...record.guest_mids.map(toMemberTag)]
  return [...new Set(tags)]
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString()
}

export function buildLiveRecordView(record: ApiLiveRecord): LiveRecordView | null {
  const startDate = getRecordStartDate(record)
  if (!startDate) return null

  const memberTags = getRecordMemberTags(record)
  const typeTag = toTypeTag(record.live_type)
  const tagKeys: TagType[] = [...memberTags, typeTag]

  return {
    record,
    startDate,
    timeLabel: formatTimeLabel(startDate),
    memberTags,
    typeTag,
    tagKeys,
  }
}
