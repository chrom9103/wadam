"use client"
import { useState } from "react"
import { createExpense as createExpenseRequest } from "@/app/lib/api/client"
import type { Share } from "../types"

export type CreateExpensePayload = {
  trip_id: string
  title: string
  amount: number
  paid_at?: string
  shares: Share[]
  itinerary_item_id?: string | null
  receipt_path?: string
}

export default function useCreateExpense() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createExpense(payload: CreateExpensePayload) {
    setLoading(true)
    setError(null)
    try {
      return await createExpenseRequest(payload)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createExpense, loading, error }
}
