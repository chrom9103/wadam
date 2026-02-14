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
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">分割詳細</h4>
      {participants.length === 0 ? (
        <p className="text-sm text-gray-500">参加メンバーが選択されていません</p>
      ) : (
        <div className="space-y-2">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="flex-1">{p.name}</div>
              {method === "equal" ? (
                <div className="text-sm text-gray-600">自動等分</div>
              ) : (
                <input
                  type="number"
                  className="w-28 border px-2 py-1 rounded-md"
                  value={values[p.id] ?? ""}
                  onChange={(e) => onChange(p.id, Number(e.target.value || 0))}
                  min={0}
                  step={method === "ratio" ? 1 : 1}
                />
              )}
              <div className="text-sm text-gray-500">
                {method === "ratio" ? "比率" : method === "fixed" ? "円" : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
