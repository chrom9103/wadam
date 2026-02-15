"use client"
import React from "react"
import FormField from "../ui/molecules/FormField"
import type { Trip } from "../../types"

// Note: Verify that the Trip type has a 'title' property.
// If it doesn't, update the Trip type definition or use the correct property name.

type Props = {
  trips: Trip[]
  loading: boolean
  selectedTripId: string
  error?: string | null
  onChange: (tripId: string) => void
}

export default function TripSelectionSection({
  trips,
  loading,
  selectedTripId,
  error,
  onChange,
}: Props) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-400 mb-5">旅行を選択</h3>

      <FormField label="旅行" error={error ?? null} required>
        {loading ? (
          <div className="w-full px-4 py-3.5 bg-gray-50/80 rounded-2xl animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
          </div>
        ) : trips.length === 0 ? (
          <div className="w-full px-4 py-3.5 bg-amber-50 rounded-2xl text-amber-700 text-sm">
            参加中の旅行がありません
          </div>
        ) : (
          <select
            value={selectedTripId}
            onChange={(e) => onChange(e.target.value)}
            className="
              w-full px-4 py-3.5
              bg-gray-50/80
              border-0 rounded-2xl
              text-gray-900
              transition-all duration-300
              focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:shadow-lg
              hover:bg-gray-100/80
              cursor-pointer
              appearance-none
            "
          >
            <option value="">選択してください</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        )}
      </FormField>
    </div>
  )
}