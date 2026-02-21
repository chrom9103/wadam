import { createClient } from "@/lib/supabase/server"
import { apiOk } from "@/app/lib/api/response"
import { requireUser } from "@/app/lib/api/guards"

export async function GET() {
  const supabase = await createClient()
  const userResult = await requireUser(supabase)
  if (!userResult.ok) {
    return userResult.response
  }

  return apiOk({
    user: {
      id: userResult.data.id,
      email: userResult.data.email ?? null,
    },
  })
}
