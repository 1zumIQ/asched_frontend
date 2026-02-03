import { http, HttpResponse } from 'msw'
import { mockLiveRecords, mockLiveTagMeta, mockLiveTags, mockVupMeta, mockVups } from '@/mocks/data/scheduleData'
import { getIsoWeekFromDate, getIsoWeekKey } from '@/utils/isoWeek'

export const handlers = [
  http.get('/api/v1/vup', async () => {
    await new Promise(resolve => setTimeout(resolve, 80))
    return HttpResponse.json(mockVups)
  }),
  http.get('/api/v1/vup_meta', async () => {
    await new Promise(resolve => setTimeout(resolve, 80))
    return HttpResponse.json(mockVupMeta)
  }),
  http.get('/api/v1/live_records/available_weeks', async () => {
    const weeks = new Map<string, { year: number; week: number }>()
    const nowWeek = getIsoWeekFromDate(new Date())
    weeks.set(getIsoWeekKey(nowWeek), nowWeek)

    mockLiveRecords.forEach((record) => {
      const date = new Date(record.start_time)
      if (Number.isNaN(date.getTime())) return
      const isoWeek = getIsoWeekFromDate(date)
      weeks.set(getIsoWeekKey(isoWeek), isoWeek)
    })

    await new Promise(resolve => setTimeout(resolve, 80))
    return HttpResponse.json([...weeks.values()])
  }),
  http.get('/api/v1/live_records/all/:year/:week', async ({ params }) => {
    const year = Number(params.year)
    const week = Number(params.week)

    const recordsForWeek = mockLiveRecords.filter((record) => {
      const date = new Date(record.start_time)
      if (Number.isNaN(date.getTime())) return false
      const recordWeek = getIsoWeekFromDate(date)
      return recordWeek.year === year && recordWeek.week === week
    })

    await new Promise(resolve => setTimeout(resolve, 120))

    return HttpResponse.json(recordsForWeek)
  }),
  http.get('/api/v1/live_tag', async () => {
    await new Promise(resolve => setTimeout(resolve, 80))
    return HttpResponse.json(mockLiveTags)
  }),
  http.get('/api/v1/live_tag_meta', async () => {
    await new Promise(resolve => setTimeout(resolve, 80))
    return HttpResponse.json(mockLiveTagMeta)
  }),
]
