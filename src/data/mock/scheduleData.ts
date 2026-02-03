import type { components } from '@/types/schema'
import type { LiveStatus, LiveType } from '@/types/ui'
import { buildMemberIndex, resolveMemberMid } from '@/data/utils/memberMap'

type ApiLiveRecord = components['schemas']['LiveRecordDto']
type ApiUser = components['schemas']['VupDto']
type ApiLiveTag = components['schemas']['LiveTagDto']
type ApiLiveTagMeta = components['schemas']['LiveTagMetaDto']

type RecordInput = {
  name: string
  title: string
  type: LiveType
  start: [number, number, number, number, number]
  end?: [number, number, number, number, number]
  status: LiveStatus
  guests?: string[]
}

export const mockUsers: ApiUser[] = [
  {
    mid: 10001,
    name: '思诺',
    nick_name_bili: '思诺',
    face_url_bili: 'https://i1.hdslb.com/bfs/face/5c5c2e1220f2a0e4f0b38f5f7e5f5e5f5e5f5e5f.jpg',
    room_id: 10001,
    sign: 'mock',
    sid: null,
  },
  {
    mid: 10002,
    name: '心宜',
    nick_name_bili: '心宜',
    face_url_bili: 'https://i0.hdslb.com/bfs/face/cc9ebd4e6c7e5e5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
    room_id: 10002,
    sign: 'mock',
    sid: null,
  },
  {
    mid: 10003,
    name: '贝拉',
    nick_name_bili: '贝拉',
    face_url_bili: 'https://i1.hdslb.com/bfs/face/3a1a7e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg',
    room_id: 10003,
    sign: 'mock',
    sid: null,
  },
  {
    mid: 10004,
    name: '乃琳',
    nick_name_bili: '乃琳',
    face_url_bili: 'nailin.jpg',
    room_id: 10004,
    sign: 'mock',
    sid: null,
  },
  {
    mid: 10005,
    name: '嘉然',
    nick_name_bili: '嘉然',
    face_url_bili: 'jiaran.jpg',
    room_id: 10005,
    sign: 'mock',
    sid: null,
  },
  {
    mid: 10006,
    name: '珈乐',
    nick_name_bili: '珈乐',
    face_url_bili: 'https://i0.hdslb.com/bfs/face/jiale-avatar.jpg',
    room_id: 10006,
    sign: 'mock',
    sid: null,
  },
  {
    mid: 10007,
    name: '向晚',
    nick_name_bili: '向晚',
    face_url_bili: 'https://i0.hdslb.com/bfs/face/xiangwan-avatar.jpg',
    room_id: 10007,
    sign: 'mock',
    sid: null,
  },
  {
    mid: 10008,
    name: 'A-SOUL',
    nick_name_bili: 'A-SOUL',
    face_url_bili: 'https://i0.hdslb.com/bfs/face/asoul-group-avatar.jpg',
    room_id: 10008,
    sign: 'mock',
    sid: null,
  },
]

export const mockLiveTags: ApiLiveTag[] = [
  { tag_id: 1, name: '日常', sort_order: 1, is_active: true },
  { tag_id: 2, name: '节目', sort_order: 2, is_active: true },
  { tag_id: 3, name: '特别', sort_order: 3, is_active: true },
]

export const mockLiveTagMeta: ApiLiveTagMeta[] = [
  { tag_id: 1, color: '#4d96ff', icon: '🌤️', meta: {} },
  { tag_id: 2, color: '#ff6b6b', icon: '🎭', meta: {} },
  { tag_id: 3, color: '#06d6a0', icon: '✨', meta: {} },
]

const mockMemberIndex = buildMemberIndex(mockUsers)

let recordCounter = 1

function toIso([year, month, day, hour, minute]: [number, number, number, number, number]): string {
  return new Date(year, month - 1, day, hour, minute).toISOString()
}

function requireMid(name: string): number {
  const mid = resolveMemberMid(name, mockMemberIndex)
  if (mid == null) {
    throw new Error(`Missing mock user for ${name}`)
  }
  return mid
}

function makeRecord(input: RecordInput): ApiLiveRecord {
  const { name, title, type, start, end, status, guests = [] } = input
  const mid = requireMid(name)

  return {
    id: `mock-${recordCounter++}`,
    mid,
    guest_mids: guests.map(requireMid),
    live_type: type,
    start_time: toIso(start),
    end_time: end ? toIso(end) : null,
    status,
    title,
  }
}

export const mockLiveRecords: ApiLiveRecord[] = [
  makeRecord({
    name: '思诺',
    title: '华语金曲连唱4.0',
    type: 3,
    start: [2026, 1, 28, 19, 30],
    end: [2026, 1, 28, 21, 30],
    status: 1,
  }),
  makeRecord({
    name: '心宜',
    title: '来吧，上才艺！',
    type: 3,
    start: [2026, 1, 28, 21, 0],
    end: [2026, 1, 28, 23, 0],
    status: 1,
  }),
  makeRecord({
    name: '思诺',
    title: '思诺直播',
    type: 1,
    start: [2026, 1, 29, 18, 0],
    status: 3,
  }),
  makeRecord({
    name: '贝拉',
    title: '时间旅行者的贝极星',
    type: 3,
    start: [2026, 1, 29, 21, 0],
    status: 0,
  }),
  makeRecord({
    name: '心宜',
    title: '心宜直播',
    type: 1,
    start: [2026, 1, 30, 16, 0],
    status: 3,
  }),
  makeRecord({
    name: '乃琳',
    title: '什么叫经典复刻？',
    type: 3,
    start: [2026, 1, 30, 19, 30],
    status: 3,
  }),
  makeRecord({
    name: '贝拉',
    title: '我勒个豆豆豆豆？',
    type: 3,
    start: [2026, 1, 30, 8, 30],
    status: 3,
  }),
  makeRecord({
    name: '嘉然',
    title: '百变小嘉然',
    type: 3,
    start: [2026, 1, 30, 21, 0],
    status: 3,
  }),
  makeRecord({
    name: '心宜',
    title: '心宜直播',
    type: 1,
    start: [2026, 1, 31, 16, 0],
    status: 3,
  }),
  makeRecord({
    name: '乃琳',
    title: '羞死了',
    type: 2,
    start: [2026, 1, 31, 20, 0],
    status: 3,
    guests: ['贝拉'],
  }),
  makeRecord({
    name: 'A-SOUL',
    title: '我来的正是时候吗？',
    type: 2,
    start: [2026, 2, 1, 20, 0],
    status: 3,
    guests: ['嘉然', '乃琳', '贝拉'],
  }),
  makeRecord({
    name: '思诺',
    title: '思诺直播',
    type: 1,
    start: [2026, 2, 2, 15, 0],
    status: 3,
  }),
  makeRecord({
    name: '思诺',
    title: '冰箱，终极易如反掌！',
    type: 2,
    start: [2026, 2, 2, 20, 0],
    status: 3,
    guests: ['心宜'],
  }),
  makeRecord({
    name: 'A-SOUL',
    title: '我来的正是时候吗？',
    type: 2,
    start: [2026, 2, 7, 20, 0],
    status: 3,
    guests: ['嘉然', '乃琳', '贝拉'],
  }),
  makeRecord({
    name: '思诺',
    title: '思诺直播',
    type: 1,
    start: [2026, 2, 5, 15, 0],
    status: 3,
  }),
  makeRecord({
    name: '思诺',
    title: '冰箱，终极易如反掌！',
    type: 2,
    start: [2026, 2, 1, 20, 0],
    status: 3,
    guests: ['心宜'],
  }),
]