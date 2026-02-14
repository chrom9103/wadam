"use client"
import React from "react"
import type { User } from "@supabase/supabase-js"

type Props = {
  user: User | null
  loading: boolean
}

export default function PayerInfo({ user, loading }: Props) {
  return (
    <div className="p-4 bg-teal-50 rounded-2xl">
      <p className="text-sm text-teal-700">
        <span className="font-medium">支払者:</span>{" "}
        {loading ? (
          <span className="inline-block w-20 h-4 bg-teal-100 rounded animate-pulse" />
        ) : user ? (
          <span className="font-semibold">あなた</span>
        ) : (
          <span className="text-amber-600">ログインしてください</span>
        )}
      </p>
    </div>
  )
}