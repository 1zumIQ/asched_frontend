import type { TagType, TagMeta, ScheduleEvent, MemberTag, TypeTag } from '@/types/schedule'

export const tagMeta: Record<TagType, TagMeta> = {
  // 成员标签
  '思诺': { label: '思诺', color: '#ec4899', tint: 'rgba(236, 72, 153, 0.12)', avatar: 'https://i1.hdslb.com/bfs/face/5c5c2e1220f2a0e4f0b38f5f7e5f5e5f5e5f5e5f.jpg' },
  '心宜': { label: '心宜', color: '#f97316', tint: 'rgba(249, 115, 22, 0.12)', avatar: 'https://i0.hdslb.com/bfs/face/cc9ebd4e6c7e5e5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg' },
  '贝拉': { label: '贝拉', color: '#8b5cf6', tint: 'rgba(139, 92, 246, 0.12)', avatar: 'https://i1.hdslb.com/bfs/face/3a1a7e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg' },
  '乃琳': { label: '乃琳', color: '#3b82f6', tint: 'rgba(59, 130, 246, 0.12)', avatar: 'https://i2.hdslb.com/bfs/face/5d5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e.jpg' },
  '嘉然': { label: '嘉然', color: '#ef4444', tint: 'rgba(239, 68, 68, 0.12)', avatar: 'jiaran.jpg' },
  'A-SOUL': { label: 'A-SOUL', color: '#6366f1', tint: 'rgba(99, 102, 241, 0.12)', avatar: 'https://i0.hdslb.com/bfs/face/asoul-group-avatar.jpg' },
  '二期团播': { label: '二期团播', color: '#14b8a6', tint: 'rgba(20, 184, 166, 0.12)', avatar: 'https://i0.hdslb.com/bfs/face/asoul-2nd-gen-avatar.jpg' },
  // 类型标签
  '日常': { label: '日常', color: '#22c55e', tint: 'rgba(34, 197, 94, 0.12)' },
  '2D': { label: '2D', color: '#0ea5e9', tint: 'rgba(14, 165, 233, 0.12)' },
  '节目': { label: '节目', color: '#a855f7', tint: 'rgba(168, 85, 247, 0.12)' },
}

// 成员标签列表（用于图例显示）
export const memberTags: MemberTag[] = ['思诺', '心宜', '贝拉', '乃琳', '嘉然', 'A-SOUL', '二期团播']
export const energyTags: TypeTag[] = ['日常', '2D', '节目']

export const weeklyPlan: Record<string, ScheduleEvent[]> = {
  "Monday": [],
  "Tuesday": [
    {
      "time": "19:30",
      "title": "【歌回】华语金曲连唱4.0",
      "tags": [
        "思诺",
        "日常"
      ]
    },
    {
      "time": "21:00",
      "title": "【才艺】来吧，上才艺！",
      "tags": [
        "心宜",
        "日常"
      ]
    }
  ],
  "Wednesday": [
    {
      "time": "18:00",
      "title": "思诺直播",
      "tags": [
        "思诺",
        "2D"
      ]
    },
    {
      "time": "21:00",
      "title": "时间旅行者的贝极星",
      "tags": [
        "贝拉",
        "日常"
      ]
    }
  ],
  "Thursday": [
    {
      "time": "16:00",
      "title": "心宜直播",
      "tags": [
        "心宜",
        "2D"
      ]
    },
    {
      "time": "19:30",
      "title": "什么叫经典复刻？",
      "tags": [
        "乃琳",
        "日常"
      ]
    },
    {
      "time": "21:00",
      "title": "百变小嘉然",
      "tags": [
        "嘉然",
        "日常"
      ]
    }
  ],
  "Friday": [
    {
      "time": "16:00",
      "title": "心宜直播",
      "tags": [
        "心宜",
        "2D"
      ]
    },
    {
      "time": "20:00",
      "title": "羞死了",
      "tags": [
        "乃琳",
        "贝拉",
        "节目"
      ]
    }
  ],
  "Saturday": [
    {
      "time": "20:00",
      "title": "我来的正是时候吗？",
      "tags": [
        "A-SOUL",
        "嘉然",
        "乃琳",
        "贝拉",
        "节目"
      ]
    }
  ],
  "Sunday": [
    {
      "time": "15:00",
      "title": "思诺直播",
      "tags": [
        "思诺",
        "2D"
      ]
    },
    {
      "time": "20:00",
      "title": "冰箱，终极易如反掌！",
      "tags": [
        "二期团播",
        "思诺",
        "心宜",
        "节目"
      ]
    }
  ]
}