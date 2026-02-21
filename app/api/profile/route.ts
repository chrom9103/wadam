import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { apiError, apiOk } from "@/app/lib/api/response"
import { requireUser } from "@/app/lib/api/guards"

const updateProfileSchema = z.object({
  display_name: z.string().max(100).nullable(),
  avatar_url: z.string().max(512).nullable(),
})

export async function GET() {
  const supabase = await createClient()
  const userResult = await requireUser(supabase)
  if (!userResult.ok) {
    return userResult.response
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", userResult.data.id)
    .maybeSingle()

  if (error) {
    return apiError("INTERNAL", error.message, 500)
  }

  return apiOk({
    display_name: data?.display_name ?? null,
    avatar_url: data?.avatar_url ?? null,
  })
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const userResult = await requireUser(supabase)
  if (!userResult.ok) {
    return userResult.response
  }

  const body = await req.json().catch(() => null)
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return apiError("INVALID_REQUEST", "Invalid request payload", 400)
  }

  const { error } = await supabase.from("profiles").upsert({
    id: userResult.data.id,
    display_name: parsed.data.display_name,
    avatar_url: parsed.data.avatar_url,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    return apiError("INTERNAL", error.message, 500)
  }

  return apiOk({
    updated: true,
  })
}
