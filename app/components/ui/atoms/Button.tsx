"use client"
import React from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...rest
}: Props) {
  const base = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-2xl
    transition-all duration-300 ease-out
    focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.97]
  `

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  }

  const variants = {
    primary: `
      bg-gray-900
      hover:bg-gray-800
      text-white
      shadow-[0_4px_14px_rgba(0,0,0,0.25)]
      hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)]
      hover:-translate-y-0.5
    `,
    secondary: `
      bg-gray-100
      text-gray-700 hover:bg-gray-200
      hover:shadow-sm
    `,
    ghost: `
      bg-transparent
      text-gray-500 hover:text-gray-700 hover:bg-gray-100
    `,
    danger: `
      bg-red-500
      hover:bg-red-600
      text-white
      shadow-[0_4px_14px_rgba(239,68,68,0.35)]
      hover:shadow-[0_6px_20px_rgba(239,68,68,0.45)]
      hover:-translate-y-0.5
    `,
  }

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
