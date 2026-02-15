"use client"
import React from "react"
import FormField from "../ui/molecules/FormField"
import type { Member } from "../../types"

type Props = {
  members: Member[]
  loading: boolean
  selectedTripId: string
  participants: string[]
  error?: string | null
  onChange: (participants: string[]) => void
}

export default function ParticipantsSection({
  members,
  loading,
  selectedTripId,
  participants,
  error,
  onChange,
}: Props) {
  const handleToggle = (memberId: string) => {
    if (participants.includes(memberId)) {
      onChange(participants.filter((id) => id !== memberId))
    } else {
      onChange([...participants, memberId])
    }
  }

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-400 mb-5">参加メンバー</h3>

      <FormField label="" error={error ?? null}>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50/80 rounded-2xl animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : !selectedTripId ? (
          <div className="p-4 bg-gray-50/80 rounded-2xl text-gray-400 text-sm text-center">
            先に旅行を選択してください
          </div>
        ) : members.length === 0 ? (
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-700 text-sm text-center">
            メンバーがいません
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {members.map((m) => (
              <label
                key={m.id}
                className="
                  flex items-center gap-3 p-4
                  bg-gray-50/80 rounded-2xl
                  cursor-pointer transition-all duration-300
                  hover:bg-gray-100 hover:shadow-sm
                  has-[:checked]:bg-teal-50 has-[:checked]:shadow-[0_0_0_2px_rgba(20,184,166,0.3)]
                "
              >
                <input
                  type="checkbox"
                  checked={participants.includes(m.id)}
                  onChange={() => handleToggle(m.id)}
                  className="
                    w-5 h-5 rounded-lg
                    border-2 border-gray-300
                    text-teal-500 focus:ring-teal-500/30
                    transition-colors
                  "
                />
                <span className="text-sm font-medium text-gray-700">{m.name}</span>
              </label>
            ))}
          </div>
        )}
      </FormField>
    </div>
  )
}