"use client"

import React from "react"
import { useRouter } from "next/navigation"
import ExpenseForm from "../../../components/expense/ExpenseForm"
import useMyTrips from "../../../hooks/useMyTrips"
import useCreateExpense from "../../../hooks/useCreateExpense"

export default function ExpenseNewPage() {
  const router = useRouter()
  const { trips, loading: tripsLoading } = useMyTrips()
  const { createExpense, loading: creating } = useCreateExpense()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <ExpenseForm
        trips={trips}
        tripsLoading={tripsLoading}
        onSubmit={async (p) => {
          try {
            await createExpense(p)
            router.push(`/trips/${p.trip_id}`)
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            alert("作成に失敗しました: " + message)
          }
        }}
      />

      {/* Loading Overlay */}
      {creating && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl px-10 py-8 shadow-[0_8px_40px_rgba(0,0,0,0.12)] flex flex-col items-center gap-5">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            <p className="text-gray-700 font-semibold text-lg">保存中...</p>
          </div>
        </div>
      )}
    </div>
  )
}
