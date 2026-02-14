"use client"
import React from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className = "", ...rest }: Props) {
  return <input className={`border px-3 py-2 rounded-md ${className}`} {...rest} />
}
