"use client"
import React from "react"
import FormField from "../ui/molecules/FormField"

type Props = {
  method: "equal" | "ratio" | "fixed"
  onChange: (method: "equal" | "ratio" | "fixed") => void
}

export default function SplitMethodSelector({ method, onChange }: Props) {
  return (
    <FormField label="分割方法" error={null}>
      <div className="flex gap-3">
        {[
          { value: "equal", label: "等分" },
          { value: "ratio", label: "比率" },
          { value: "fixed", label: "固定額" },
        ].map((opt) => (
          <label
            key={opt.value}
            className="
              flex-1 flex items-center justify-center gap-2 py-3.5
              bg-gray-50/80 rounded-2xl
              cursor-pointer transition-all duration-300
              hover:bg-gray-100
              has-[:checked]:bg-teal-500 has-[:checked]:text-white has-[:checked]:shadow-lg has-[:checked]:shadow-teal-500/25
            "
          >
            <input
              type="radio"
              value={opt.value}
              checked={method === opt.value}
              onChange={(e) => onChange(e.target.value as "equal" | "ratio" | "fixed")}
              className="sr-only"
            />
            <span className="text-sm font-medium">{opt.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  )
}