"use client"
import { useState, useEffect } from "react"

export type Trip = {
  id: string
  name: string
  description?: string
  start_date?: string
  end_date?: string
}

export default function useMyTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch("/api/trips/my")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        // expect { trips: [...] } or array
        if (Array.isArray(data)) setTrips(data)
        else setTrips(data.trips ?? [])
      })
      .catch((err) => setError(err?.message ?? String(err)))
      .finally(() => setLoading(false))
  }, [])

  return { trips, loading, error }
}
