"use client"
import { useState } from "react"

export type CreateExpensePayload = {
  trip_id: string
  title: string
  amount: number
  paid_at?: string
  payer_id: string
  shares: { user_id: string; amount_owed: number }[]
  itinerary_item_id?: string | null
}

export default function useCreateExpense() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createExpense(payload: CreateExpensePayload) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        const message = text || `HTTP ${res.status}`
        setError(message)
        throw new Error(message)
      }

      const data = await res.json()
      return data
    } finally {
      setLoading(false)
    }
  }

  return { createExpense, loading, error }
}
