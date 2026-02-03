import type { components } from '@/types/schema'

export type IsoWeek = components['schemas']['IsoWeekTz']

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export function getIsoWeekFromDate(date: Date): IsoWeek {
  const target = new Date(date.valueOf())
  const dayNr = (target.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const isoYear = target.getFullYear()
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / MS_PER_WEEK)

  return { year: isoYear, week }
}

export function getCurrentIsoWeek(): IsoWeek {
  return getIsoWeekFromDate(new Date())
}

export function getIsoWeekStartDate(week: IsoWeek): Date {
  const jan4 = new Date(week.year, 0, 4)
  const jan4Day = (jan4.getDay() + 6) % 7
  const week1Monday = new Date(jan4)
  week1Monday.setDate(jan4.getDate() - jan4Day)
  week1Monday.setHours(0, 0, 0, 0)

  const monday = new Date(week1Monday)
  monday.setDate(week1Monday.getDate() + (week.week - 1) * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function getIsoWeekKey(week: IsoWeek): string {
  return `${week.year}-${String(week.week).padStart(2, '0')}`
}

export function compareIsoWeeks(a: IsoWeek, b: IsoWeek): number {
  if (a.year !== b.year) return a.year - b.year
  return a.week - b.week
}

export function formatIsoWeekLabel(week: IsoWeek): string {
  return `${week.year}年第${week.week}周`
}

export function getIsoWeekRangeLabel(week: IsoWeek, locale: string): string {
  const start = getIsoWeekStartDate(week)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  const startLabel = start.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
  const endLabel = end.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return `${startLabel} - ${endLabel}`
}
