"use client"
import { useState, useEffect } from "react"
import { getTripMembers } from "@/app/lib/api/client"
import type { Member } from "../types"

export default function useMembers(tripId?: string) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState<boolean>(Boolean(tripId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    if (!tripId) {
      return () => controller.abort()
    }

    Promise.resolve()
      .then(() => {
        setLoading(true)
        setError(null)
        return getTripMembers(tripId, controller.signal)
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setMembers(data)
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setError(err?.message ?? String(err))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [tripId])

  if (!tripId) {
    return { members: [], loading: false, error: null }
  }

  return { members, loading, error }
}
