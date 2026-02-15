import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Member } from "@/app/types"

export async function GET(req: Request, { params }: { params: { trip: string } }) {
  const { trip } = await params
  const supabase = await createClient()

  const { data: userResp } = await supabase.auth.getUser()
  const user = userResp.user
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 })

  const { data: membership, error: memErr } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", trip)
    .eq("user_id", user.id)
    .maybeSingle()

  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 500 })
  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const { data: rows, error: rowsErr } = await supabase
    .from("trip_members")
    .select(
      `
      profiles:profiles!trip_members_user_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `
    )
    .eq("trip_id", trip)

  if (rowsErr) return NextResponse.json({ error: rowsErr.message }, { status: 500 })

  const members: Member[] = (rows || [])
    .map((r: any) => r.profiles)
    .filter(Boolean)
    .map((p: any) => ({
      id: p.id,
      name: p.display_name ?? "",
      avatar_url: p.avatar_url ?? null,
    }))

  return NextResponse.json({ members })
}
