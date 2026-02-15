"use client"
import React from "react"

type Member = { id: string; name: string }

type Props = {
  participants: Member[]
  method: "equal" | "ratio" | "fixed"
  values: Record<string, number>
  onChange: (userId: string, value: number) => void
}

export default function SplitSelector({ participants, method, values, onChange }: Props) {
  if (participants.length === 0) {
    return (
      <div className="mb-6 p-5 rounded-2xl bg-gray-50/80">
        <p className="text-sm text-gray-400 text-center">参加メンバーを選択してください</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">分割詳細</h4>
      <div className="space-y-2 p-5 rounded-2xl bg-gray-50/50">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-teal-500/20">
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 text-sm font-medium text-gray-700">{p.name}</div>
            {method === "equal" ? (
              <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-teal-100 text-teal-700">
                自動等分
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  className="
                    w-24 px-4 py-2
                    bg-white rounded-xl
                    text-gray-900 text-sm text-right font-medium
                    border-0 shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-teal-500/20
                    transition-all duration-300
                  "
                  value={values[p.id] ?? ""}
                  onChange={(e) => onChange(p.id, Number(e.target.value || 0))}
                  min={0}
                  placeholder="0"
                />
                <span className="text-xs text-gray-400 w-8">
                  {method === "ratio" ? "比率" : "円"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
