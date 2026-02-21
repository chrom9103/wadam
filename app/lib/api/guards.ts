import "server-only"

import type { SupabaseClient, User } from "@supabase/supabase-js"
import { apiError } from "./response"

type GuardResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      response: Response
    }

export async function requireUser(supabase: SupabaseClient): Promise<GuardResult<User>> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    return {
      ok: false,
      response: apiError("INTERNAL", error.message, 500),
    }
  }

  if (!user) {
    return {
      ok: false,
      response: apiError("UNAUTHORIZED", "Unauthorized", 401),
    }
  }

  return {
    ok: true,
    data: user,
  }
}

export async function requireTripMember(
  supabase: SupabaseClient,
  userId: string,
  tripId: string
): Promise<GuardResult<true>> {
  const { data: membership, error } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    return {
      ok: false,
      response: apiError("INTERNAL", error.message, 500),
    }
  }

  if (!membership) {
    return {
      ok: false,
      response: apiError("FORBIDDEN", "Forbidden", 403),
    }
  }

  return {
    ok: true,
    data: true,
  }
}
