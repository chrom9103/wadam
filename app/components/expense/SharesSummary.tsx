"use client"
import React from "react"
import type { Member, Share } from "../../types"

type Props = {
  shares: Share[]
  members: Member[]
}

export default function SharesSummary({ shares, members }: Props) {
  if (shares.length === 0) return null

  return (
    <div className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl">
      <h4 className="text-sm font-medium text-teal-700 mb-4">計算結果</h4>
      <div className="space-y-3">
        {shares.map((s) => (
          <div key={s.user_id} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {members.find((m) => m.id === s.user_id)?.name ?? s.user_id}
            </span>
            <span className="text-xl font-semibold text-gray-900">
              ¥{s.amount_owed.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}