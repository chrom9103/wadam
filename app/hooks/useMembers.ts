"use client"
import { useState, useEffect } from "react"
import { fetchJson } from "../lib/http"
import type { Member } from "../types"

export default function useMembers(tripId?: string) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    if (!tripId) {
      setMembers([])
      setLoading(false)
      setError(null)
      return () => controller.abort()
    }

    setLoading(true)
    setError(null)

    fetchJson<{ members: Member[] }>(`/api/trips/${tripId}/members`, {
      signal: controller.signal,
    })
      .then((data) => setMembers(data.members ?? []))
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setError(err?.message ?? String(err))
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [tripId])

  return { members, loading, error }
}
