"use client"
import React from "react"

type Props = {
  children: React.ReactNode
  className?: string
}

export default function Icon({ children, className = "" }: Props) {
  return <span className={`inline-flex items-center ${className}`}>{children}</span>
}
