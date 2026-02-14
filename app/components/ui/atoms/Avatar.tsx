"use client"
import React from "react"

type Props = {
  name?: string
  size?: number
  className?: string
}

export default function Avatar({ name = "?", size = 32, className = "" }: Props) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="text-sm font-medium">{initials}</span>
    </div>
  )
}
