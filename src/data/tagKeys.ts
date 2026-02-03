import type { MemberId, LiveTypeId, MemberTag, TagKind, TagType, TypeTag } from '@/types/ui'

const MEMBER_PREFIX = 'member:'
const TYPE_PREFIX = 'type:'

export function toMemberTag(mid: MemberId): MemberTag {
  return `${MEMBER_PREFIX}${mid}`
}

export function toTypeTag(typeId: LiveTypeId): TypeTag {
  return `${TYPE_PREFIX}${typeId}`
}

export function isMemberTag(tag: TagType): tag is MemberTag {
  return tag.startsWith(MEMBER_PREFIX)
}

export function isTypeTag(tag: TagType): tag is TypeTag {
  return tag.startsWith(TYPE_PREFIX)
}

export function parseTagKey(tag: TagType): { kind: TagKind; id: number } {
  if (isMemberTag(tag)) {
    const id = Number(tag.slice(MEMBER_PREFIX.length))
    return { kind: 'member', id: Number.isNaN(id) ? -1 : id }
  }
  const id = Number(tag.slice(TYPE_PREFIX.length))
  return { kind: 'type', id: Number.isNaN(id) ? -1 : id }
}
