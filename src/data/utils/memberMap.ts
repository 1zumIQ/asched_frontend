import type { components } from '@/types/schema'

export type ApiUser = components['schemas']['VupDto']

export type MemberIndex = {
  byMid: Map<number, ApiUser>
  byName: Map<string, ApiUser>
}

export function buildMemberIndex(users: ApiUser[]): MemberIndex {
  const byMid = new Map<number, ApiUser>()
  const byName = new Map<string, ApiUser>()

  users.forEach((user) => {
    byMid.set(user.mid, user)
    byName.set(user.name, user)
  })

  return { byMid, byName }
}

export function resolveMemberName(mid: number, index?: MemberIndex): string {
  return index?.byMid.get(mid)?.name ?? `MID:${mid}`
}

export function resolveMemberNames(mids: number[], index?: MemberIndex): string[] {
  const names = mids.map(mid => resolveMemberName(mid, index))
  return names.filter((name, idx, list) => list.indexOf(name) === idx)
}

export function resolveMemberMid(name: string, index?: MemberIndex): number | null {
  return index?.byName.get(name)?.mid ?? null
}
