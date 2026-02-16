"use client"
import React from "react"
import Image from "next/image"

type Props = {
  name?: string
  size?: "sm" | "md" | "lg"
  className?: string
  src?: string
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
}

const gradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-violet-500 to-purple-600",
]

function getGradient(name: string) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

export default function Avatar({ name = "?", size = "md", className = "", src }: Props) {
  const sizePx = size === "sm" ? 32 : size === "md" ? 40 : 48
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const gradient = getGradient(name)

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={sizePx}
        height={sizePx}
        unoptimized
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-gray-200 ${className}`}
      />
    )
  }

  return (
    <div
      className={`
        ${sizes[size]}
        inline-flex items-center justify-center
        rounded-full
        bg-gradient-to-br ${gradient}
        font-semibold text-white
        ring-2 ring-white
        shadow-md
        ${className}
      `}
      aria-hidden
    >
      {initials}
    </div>
  )
}
