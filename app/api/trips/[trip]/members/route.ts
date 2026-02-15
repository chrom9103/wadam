import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Member } from "@/app/types"

type TripMemberRow = {
  profiles: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }[] | null
}

function isTripMemberRow(value: unknown): value is TripMemberRow {
  if (!value || typeof value !== "object") return false
  if (!("profiles" in value)) return false
  const profiles = (value as { profiles?: unknown }).profiles
  return profiles == null || Array.isArray(profiles)
}

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

  const members: Member[] = (Array.isArray(rows) ? rows : [])
    .filter(isTripMemberRow)
    .flatMap((row) => row.profiles ?? [])
    .map((profile) => ({
      id: profile.id,
      name: profile.display_name ?? "",
      avatar_url: profile.avatar_url ?? null,
    }))

  return NextResponse.json({ members })
}
