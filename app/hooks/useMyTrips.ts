"use client"
import { useState, useEffect } from "react"
import { fetchJson } from "../lib/http"
import type { Trip } from "../types"

export default function useMyTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetchJson<{ trips: Trip[] }>("/api/trips/my", { signal: controller.signal })
      .then((data) => setTrips(data.trips ?? []))
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setError(err?.message ?? String(err))
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return { trips, loading, error }
}
