import type { CreateExpensePayload } from "@/app/hooks/useCreateExpense"
import type { Member, Trip } from "@/app/types"

export type CurrentUser = {
  id: string
  email: string | null
}

export type Profile = {
  display_name: string | null
  avatar_url: string | null
}

type ApiErrorCode = "INVALID_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "INTERNAL"

type ApiSuccess<T> = {
  data: T
}

type ApiFailure = {
  error: {
    code: ApiErrorCode
    message: string
  }
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode | "UNKNOWN",
    public readonly status: number
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}

async function requestApi<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  const json = (await res.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null

  if (!res.ok) {
    if (json && "error" in json) {
      throw new ApiClientError(json.error.message, json.error.code, res.status)
    }

    throw new ApiClientError(`HTTP ${res.status}`, "UNKNOWN", res.status)
  }

  if (!json || !("data" in json)) {
    throw new ApiClientError("Invalid API response", "UNKNOWN", res.status)
  }

  return json.data
}

export async function getMyTrips(signal?: AbortSignal): Promise<Trip[]> {
  const data = await requestApi<{ trips: Trip[] }>("/api/trips/my", { signal })
  return data.trips ?? []
}

export async function getTripMembers(tripId: string, signal?: AbortSignal): Promise<Member[]> {
  const data = await requestApi<{ members: Member[] }>(`/api/trips/${tripId}/members`, { signal })
  return data.members ?? []
}

export async function createExpense(input: CreateExpensePayload): Promise<{ id: string }> {
  return await requestApi<{ id: string }>("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}

export async function getCurrentUser(signal?: AbortSignal): Promise<CurrentUser> {
  const data = await requestApi<{ user: CurrentUser }>("/api/me", { signal })
  return data.user
}

export async function getProfile(signal?: AbortSignal): Promise<Profile> {
  return await requestApi<Profile>("/api/profile", { signal })
}

export async function updateProfile(input: Profile): Promise<void> {
  await requestApi<{ updated: boolean }>("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}

export async function uploadAvatar(file: File): Promise<{ path: string }> {
  const formData = new FormData()
  formData.append("file", file)

  return await requestApi<{ path: string }>("/api/uploads/avatar", {
    method: "POST",
    body: formData,
  })
}

export async function uploadReceipt(tripId: string, file: File): Promise<{ path: string }> {
  const formData = new FormData()
  formData.append("tripId", tripId)
  formData.append("file", file)

  return await requestApi<{ path: string }>("/api/uploads/receipt", {
    method: "POST",
    body: formData,
  })
}

export async function getSignedDownloadUrl(bucket: "avatars" | "receipts", path: string): Promise<string> {
  const data = await requestApi<{ url: string; expiresIn: number }>("/api/downloads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, path }),
  })

  return data.url
}
