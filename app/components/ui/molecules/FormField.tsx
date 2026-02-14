"use client"
import React from "react"

type Props = {
  label: string
  name?: string
  error?: string | null
  children: React.ReactNode
}

export default function FormField({ label, error, children }: Props) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
