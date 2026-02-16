import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const trips = (Array.isArray(tripMembers) ? tripMembers : [])
    .filter(isTripMemberRow)
    .flatMap((row) => row.trips ?? [])

  return NextResponse.json({ trips })
}
