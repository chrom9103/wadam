"use client"
import React from "react"

type Props = {
  label: string
  name?: string
  error?: string | null
  hint?: string
  required?: boolean
  children: React.ReactNode
}

export default function FormField({ label, error, hint, required, children }: Props) {
  return (
    <div className="mb-6">
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="mt-2 text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
