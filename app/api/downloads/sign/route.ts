import { z } from "zod"
import { apiError, apiOk } from "@/app/lib/api/response"
import { requireTripMember, requireUser } from "@/app/lib/api/guards"
import { createClient } from "@/lib/supabase/server"

const requestSchema = z.object({
  bucket: z.enum(["avatars", "receipts"]),
  path: z.string().min(1),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const userResult = await requireUser(supabase)
  if (!userResult.ok) {
    return userResult.response
  }

  const body = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return apiError("INVALID_REQUEST", "Invalid request payload", 400)
  }

  const { bucket, path } = parsed.data

  if (bucket === "avatars") {
    if (!path.startsWith(`${userResult.data.id}/`)) {
      return apiError("FORBIDDEN", "Forbidden", 403)
    }
  }

  if (bucket === "receipts") {
    const [tripId] = path.split("/")
    if (!tripId) {
      return apiError("INVALID_REQUEST", "Invalid path", 400)
    }

    const memberResult = await requireTripMember(supabase, userResult.data.id, tripId)
    if (!memberResult.ok) {
      return memberResult.response
    }
  }

  const expiresIn = 60 * 60
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    return apiError("INTERNAL", error?.message ?? "Failed to create signed URL", 500)
  }

  return apiOk({
    url: data.signedUrl,
    expiresIn,
  })
}
