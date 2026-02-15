import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

  const trips = (tripMembers || [])
    .map((tm: any) => tm.trips)
    .filter(Boolean)

  return NextResponse.json({ trips })
}
