import type { TagType, TagMeta, MemberTag, TypeTag, LiveRecordItem, LiveType, LiveTypeMetadata, LiveStatus } from '@/types/schedule'

export const mockTagMeta: Record<TagType, TagMeta> = {
  // 成员标签
  '思诺': { label: '思诺', color: '#ec4899', tint: 'rgba(236, 72, 153, 0.12)', avatar: 'https://i1.hdslb.com/bfs/face/5c5c2e1220f2a0e4f0b38f5f7e5f5e5f5e5f5e5f.jpg' },
  '心宜': { label: '心宜', color: '#f97316', tint: 'rgba(249, 115, 22, 0.12)', avatar: 'https://i0.hdslb.com/bfs/face/cc9ebd4e6c7e5e5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg' },
  '贝拉': { label: '贝拉', color: '#8b5cf6', tint: 'rgba(139, 92, 246, 0.12)', avatar: 'https://i1.hdslb.com/bfs/face/3a1a7e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg' },
  '乃琳': { label: '乃琳', color: '#3b82f6', tint: 'rgba(59, 130, 246, 0.12)', avatar: 'https://i2.hdslb.com/bfs/face/5d5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg' },
  '嘉然': { label: '嘉然', color: '#ef4444', tint: 'rgba(239, 68, 68, 0.12)', avatar: 'jiaran.jpg' },
  '珈乐': { label: '珈乐', color: '#a855f7', tint: 'rgba(168, 85, 247, 0.12)', avatar: 'https://i0.hdslb.com/bfs/face/jiale-avatar.jpg' },
  '向晚': { label: '向晚', color: '#06b6d4', tint: 'rgba(6, 182, 212, 0.12)', avatar: 'https://i0.hdslb.com/bfs/face/xiangwan-avatar.jpg' },
  'A-SOUL': { label: 'A-SOUL', color: '#6366f1', tint: 'rgba(99, 102, 241, 0.12)', avatar: 'https://i0.hdslb.com/bfs/face/asoul-group-avatar.jpg' },
  // 类型标签
  '其它': { label: '其它', color: '#6b7280', tint: 'rgba(107, 114, 128, 0.12)' },
  '2D': { label: '2D', color: '#0ea5e9', tint: 'rgba(14, 165, 233, 0.12)' },
  '节目': { label: '节目', color: '#a855f7', tint: 'rgba(168, 85, 247, 0.12)' },
  '日常': { label: '日常', color: '#22c55e', tint: 'rgba(34, 197, 94, 0.12)' },
  '突击': { label: '突击', color: '#f59e0b', tint: 'rgba(245, 158, 11, 0.12)' },
  '推广': { label: '推广', color: '#8b5cf6', tint: 'rgba(139, 92, 246, 0.12)' },
  '电台': { label: '电台', color: '#ec4899', tint: 'rgba(236, 72, 153, 0.12)' },
  '特别': { label: '特别', color: '#ef4444', tint: 'rgba(239, 68, 68, 0.12)' },
  '枝江综艺': { label: '枝江综艺', color: '#14b8a6', tint: 'rgba(20, 184, 166, 0.12)' },
}

// 成员标签列表（用于图例显示）
export const mockMemberTags: MemberTag[] = ['思诺', '心宜', '贝拉', '乃琳', '嘉然', '珈乐', '向晚', 'A-SOUL']
export const mockTypeTags: TypeTag[] = ['其它', '2D', '节目', '日常', '突击', '推广', '电台', '特别', '枝江综艺']

// 直播类型元数据（从后端获取）
export const mockLiveTypeMetadata: LiveTypeMetadata[] = [
  { id: 0, name: '其它', icon: '📝', color: '#6b7280', description: '其他类型的直播' },
  { id: 1, name: '2D', icon: '🎨', color: '#0ea5e9', description: '2D虚拟形象直播' },
  { id: 2, name: '节目', icon: '📺', color: '#a855f7', description: '特别节目' },
  { id: 3, name: '日常', icon: '☕', color: '#22c55e', description: '日常直播' },
  { id: 4, name: '突击', icon: '⚡', color: '#f59e0b', description: '突击直播' },
  { id: 5, name: '推广', icon: '📢', color: '#8b5cf6', description: '推广活动' },
  { id: 6, name: '电台', icon: '📻', color: '#ec4899', description: '电台节目' },
  { id: 7, name: '特别', icon: '⭐', color: '#ef4444', description: '特别活动' },
  { id: 8, name: '枝江综艺', icon: '🎪', color: '#14b8a6', description: '枝江综艺节目' },
]

// Mock直播记录数据（对应后端LiveRecordItem）
export const mockLiveRecords: LiveRecordItem[] = [
  {
    name: '思诺',
    title: '华语金曲连唱4.0',
    guests: [],
    type: 3, // 日常
    start_time: '26-01-28 19:30',
    end_time: '26-01-28 21:30',
    status: 1 // 已结束
  },
  {
    name: '心宜',
    title: '来吧，上才艺！',
    guests: [],
    type: 3, // 日常
    start_time: '26-01-28 21:00',
    end_time: '26-01-28 23:00',
    status: 1 // 已结束
  },
  {
    name: '思诺',
    title: '思诺直播',
    guests: [],
    type: 1, // 2D
    start_time: '26-01-29 18:00',
    status: 3 // 未开始
  },
  {
    name: '贝拉',
    title: '时间旅行者的贝极星',
    guests: [],
    type: 3, // 日常
    start_time: '26-01-29 21:00',
    status: 0 // 未开始
  },
  {
    name: '心宜',
    title: '心宜直播',
    guests: [],
    type: 1, // 2D
    start_time: '26-01-30 16:00',
    status: 3 // 未开始
  },
  {
    name: '乃琳',
    title: '什么叫经典复刻？',
    guests: [],
    type: 3, // 日常
    start_time: '26-01-30 19:30',
    status: 3 // 未开始
  },
  {
    name: '贝拉',
    title: '我勒个豆豆豆豆？',
    guests: [],
    type: 3, // 日常
    start_time: '26-01-30 8:30',
    status: 3 // 未开始
  },
  {
    name: '嘉然',
    title: '百变小嘉然',
    guests: [],
    type: 3, // 日常
    start_time: '26-01-30 21:00',
    status: 3 // 未开始
  },
  {
    name: '心宜',
    title: '心宜直播',
    guests: [],
    type: 1, // 2D
    start_time: '26-01-31 16:00',
    status: 3 // 未开始
  },
  {
    name: '乃琳',
    title: '羞死了',
    guests: ['贝拉'],
    type: 2, // 节目
    start_time: '26-01-31 20:00',
    status: 3 // 未开始
  },
  {
    name: 'A-SOUL',
    title: '我来的正是时候吗？',
    guests: ['嘉然', '乃琳', '贝拉'],
    type: 2, // 节目
    start_time: '26-02-01 20:00',
    status: 3 // 未开始
  },
  {
    name: '思诺',
    title: '思诺直播',
    guests: [],
    type: 1, // 2D
    start_time: '26-02-02 15:00',
    status: 3 // 未开始
  },
  {
    name: '思诺',
    title: '冰箱，终极易如反掌！',
    guests: ['心宜'],
    type: 2, // 节目
    start_time: '26-02-02 20:00',
    status: 3 // 未开始
  }
]
