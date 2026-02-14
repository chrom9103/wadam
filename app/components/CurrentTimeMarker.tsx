"use client"

import React, { useEffect, useState } from "react"

type Item = { id: string; timestamp: string | null }

export default function CurrentTimeMarker({ items }: { items: Item[] }) {
  const [topPx, setTopPx] = useState<number | null>(null)

  useEffect(() => {
    const container = document.getElementById("timeline-container")
    if (!container) return

    const ts = items.map((it) => (it.timestamp ? new Date(it.timestamp).getTime() : null)).filter((v): v is number => !!v)
    if (!ts.length) return
    const min = Math.min(...ts)
    const max = Math.max(...ts)
    const span = Math.max(1, max - min)

    const compute = () => {
      const now = Date.now()
      const clamped = Math.max(min, Math.min(now, max))
      const proportion = (clamped - min) / span
      // Use container.scrollHeight to map across all content height
      const height = container.scrollHeight
      const y = proportion * height
      setTopPx(y)
    }

    compute()
    const iv = setInterval(compute, 30 * 1000)
    window.addEventListener("resize", compute)
    return () => {
      clearInterval(iv)
      window.removeEventListener("resize", compute)
    }
  }, [items])

  if (topPx === null) return null

  return (
    <div style={{ position: "absolute", left: 64, top: topPx, transform: "translateY(-50%)", pointerEvents: "none", zIndex: 30 }}>
      <div style={{ width: 12, height: 12, borderRadius: 999, background: "#2563eb", boxShadow: "0 0 0 6px rgba(37,99,235,0.12)" }} />
    </div>
  )
}
