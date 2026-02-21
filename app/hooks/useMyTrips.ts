"use client"
import { useState, useEffect } from "react"
import { getMyTrips } from "@/app/lib/api/client"
import type { Trip } from "../types"

export default function useMyTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getMyTrips(controller.signal)
      .then((data) => setTrips(data))
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
