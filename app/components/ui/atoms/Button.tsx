"use client"
import React from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost"
}

export default function Button({ children, className = "", variant = "primary", ...rest }: Props) {
  const base = "px-4 py-2 rounded-md font-medium"
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-transparent text-gray-700 hover:bg-gray-100"

  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  )
}
