import { createClient } from '@/lib/supabase/server'
import { apiError, apiOk } from '@/app/lib/api/response'
import { requireUser } from '@/app/lib/api/guards'

type TripMemberRow = {
  trips: {
    id: string
    title: string
  }[] | null
}

function isTripMemberRow(value: unknown): value is TripMemberRow {
  if (!value || typeof value !== "object") return false
  if (!("trips" in value)) return false
  const trips = (value as { trips?: unknown }).trips
  return trips == null || Array.isArray(trips)
}

export async function GET() {
  const supabase = await createClient()

  const userResult = await requireUser(supabase)
  if (!userResult.ok) {
    return userResult.response
  }

  const { data: tripMembers, error } = await supabase
    .from('trip_members')
    .select(
      `
      trips:trip_id (
        id,
        title
      )
    `
    )
    .eq('user_id', userResult.data.id)
    .order('created_at', { ascending: false })

  if (error) {
    return apiError('INTERNAL', error.message, 500)
  }

  const trips = (Array.isArray(tripMembers) ? tripMembers : [])
    .filter(isTripMemberRow)
    .flatMap((row) => row.trips ?? [])

  return apiOk({ trips })
}
