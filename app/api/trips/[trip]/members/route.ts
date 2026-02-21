import { createClient } from "@/lib/supabase/server"
import type { Member } from "@/app/types"
import { apiError, apiOk } from "@/app/lib/api/response"
import { requireTripMember, requireUser } from "@/app/lib/api/guards"

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

export async function GET(_req: Request, { params }: { params: Promise<{ trip: string }> }) {
  const { trip } = await params
  const supabase = await createClient()

  const userResult = await requireUser(supabase)
  if (!userResult.ok) {
    return userResult.response
  }

  const memberResult = await requireTripMember(supabase, userResult.data.id, trip)
  if (!memberResult.ok) {
    return memberResult.response
  }

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

  if (rowsErr) return apiError("INTERNAL", rowsErr.message, 500)

  const members: Member[] = (Array.isArray(rows) ? rows : [])
    .filter(isTripMemberRow)
    .flatMap((row) => row.profiles ?? [])
    .map((profile) => ({
      id: profile.id,
      name: profile.display_name ?? "",
      avatar_url: profile.avatar_url ?? null,
    }))

  return apiOk({ members })
}
