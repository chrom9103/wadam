"use client"
import { useState, useEffect } from "react"

export type Member = { id: string; name: string }

export default function useMembers(tripId?: string) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tripId) {
      setMembers([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`/api/trips/${tripId}/members`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        // expect { members: [{id,name}, ...] } or array
        if (Array.isArray(data)) setMembers(data)
        else setMembers(data.members ?? [])
      })
      .catch((err) => setError(err?.message ?? String(err)))
      .finally(() => setLoading(false))
  }, [tripId])

  return { members, loading, error }
}
