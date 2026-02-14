import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: userResp } = await supabase.auth.getUser()
  const user = userResp.user
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  // 1) get trip_ids from trip_members
  const { data: tms, error: tmErr } = await supabase
    .from('trip_members')
    .select('trip_id')
    .eq('user_id', user.id)

  if (tmErr) return NextResponse.json({ error: tmErr.message }, { status: 500 })

  const tripIds = (tms || []).map((r: any) => r.trip_id)
  if (tripIds.length === 0) return NextResponse.json({ trips: [] })

  // 2) fetch trips
  const { data: trips, error: tripsErr } = await supabase
    .from('trips')
    .select('id, title, start_date, end_date, created_by')
    .in('id', tripIds)
    .order('start_date', { ascending: false })

  if (tripsErr) return NextResponse.json({ error: tripsErr.message }, { status: 500 })

  return NextResponse.json({ trips })
}
