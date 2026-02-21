import { apiError, apiOk } from "@/app/lib/api/response"
import { requireUser } from "@/app/lib/api/guards"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const userResult = await requireUser(supabase)
  if (!userResult.ok) {
    return userResult.response
  }

  const form = await req.formData().catch(() => null)
  if (!form) {
    return apiError("INVALID_REQUEST", "Invalid form data", 400)
  }

  const file = form.get("file")
  if (!(file instanceof File)) {
    return apiError("INVALID_REQUEST", "file is required", 400)
  }

  const maxSizeBytes = 2 * 1024 * 1024
  const allowedExt = ["png", "jpg", "jpeg", "gif", "webp"]

  const fileExt = file.name.split(".").pop()?.toLowerCase()
  if (!fileExt || !allowedExt.includes(fileExt)) {
    return apiError("INVALID_REQUEST", "Unsupported file type", 400)
  }

  if (!file.type.startsWith("image/")) {
    return apiError("INVALID_REQUEST", "Invalid mime type", 400)
  }

  if (file.size > maxSizeBytes) {
    return apiError("INVALID_REQUEST", "File too large", 400)
  }

  const filePath = `${userResult.data.id}/${crypto.randomUUID()}.${fileExt}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, fileBuffer, { upsert: false, contentType: file.type })

  if (error) {
    return apiError("INTERNAL", error.message, 500)
  }

  return apiOk({ path: filePath })
}
