"use client"
import { useState, useEffect } from "react"
import { ApiClientError, getCurrentUser, type CurrentUser } from "@/app/lib/api/client"

export default function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const controller = new AbortController()

    getCurrentUser(controller.signal)
      .then((currentUser) => setUser(currentUser))
      .catch((error: unknown) => {
        if (error instanceof ApiClientError && error.code === "UNAUTHORIZED") {
          setUser(null)
          return
        }

        if ((error as { name?: string })?.name !== "AbortError") {
          console.error("Failed to load current user", error)
          setUser(null)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  return { user, loading }
}
