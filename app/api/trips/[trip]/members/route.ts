import { NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'

export async function GET(req: Request, { params }: { params: { trip: string }}) {
  const { trip } = params
  const supabase = await createClient()

  const { data: userResp } = await supabase.auth.getUser()
  const user = userResp.user
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  // Ensure the caller is a member of the trip: rely on RLS ideally, but we can do an explicit check for nicer error
  const { data: membership, error: memErr } = await supabase
    .from('trip_members')
    .select('id')
    .eq('trip_id', trip)
    .eq('user_id', user.id)
    .limit(1)

  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 500 })
  if (!membership || membership.length === 0) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // fetch members' profiles
  const { data: tms, error: tmErr } = await supabase
    .from('trip_members')
    .select('user_id')
    .eq('trip_id', trip)

  if (tmErr) return NextResponse.json({ error: tmErr.message }, { status: 500 })

  const userIds = (tms || []).map((r: any) => r.user_id)
  if (userIds.length === 0) return NextResponse.json({ members: [] })

  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds)

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 })

  // normalize name field to `name` to match existing hooks/components
  const members = (profiles || []).map((p: any) => ({ id: p.id, name: p.display_name ?? '', avatar_url: p.avatar_url }))

  return NextResponse.json({ members })
}
