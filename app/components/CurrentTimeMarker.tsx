"use client"

import React, { useEffect, useState, useCallback } from "react"

type Props = {
  /** タイムラインコンテナの id */
  containerId: string
  /** テスト用の固定時刻（ISO文字列）。省略すると Date.now() を使用 */
  testNow?: string
}

export default function CurrentTimeMarker({ containerId, testNow }: Props) {
  const [topPx, setTopPx] = useState<number | null>(null)

  const compute = useCallback(() => {
    const container = document.getElementById(containerId)
    if (!container) return

    // data-timestamp を持つ全要素を取得し、時刻順にソート
    const els = Array.from(container.querySelectorAll<HTMLElement>("[data-timestamp]"))
    const entries = els
      .map((el) => ({ el, ts: new Date(el.dataset.timestamp!).getTime() }))
      .filter((e) => !isNaN(e.ts))
      .sort((a, b) => a.ts - b.ts)

    if (!entries.length) return

    const now = testNow ? new Date(testNow).getTime() : Date.now()
    const containerRect = container.getBoundingClientRect()

    // 現在時刻が全範囲より前 -- 最初のイベントの「上」にマーカーを出す
    if (now <= entries[0].ts) {
      const elRect = entries[0].el.getBoundingClientRect()
      // 要素の上端より少し上に配置（マージンは 12px）。コンテナ上端を越えないようにクランプ。
      const y = elRect.top - containerRect.top - 12
      setTopPx(Math.max(0, y))
      return
    }

    // 現在時刻が全範囲より後
    if (now >= entries[entries.length - 1].ts) {
      const elRect = entries[entries.length - 1].el.getBoundingClientRect()
      setTopPx(elRect.top - containerRect.top + elRect.height / 2)
      return
    }

    // 前後のアイテムを見つけて線形補間
    for (let i = 0; i < entries.length - 1; i++) {
      const a = entries[i]
      const b = entries[i + 1]
      if (now >= a.ts && now <= b.ts) {
        const aRect = a.el.getBoundingClientRect()
        const bRect = b.el.getBoundingClientRect()
        const aY = aRect.top - containerRect.top + aRect.height / 2
        const bY = bRect.top - containerRect.top + bRect.height / 2
        const span = b.ts - a.ts
        const ratio = span > 0 ? (now - a.ts) / span : 0
        setTopPx(aY + (bY - aY) * ratio)
        return
      }
    }
  }, [containerId, testNow])

  useEffect(() => {
    // 初回は少し遅延してDOMレイアウト完了を待つ
    const timer = setTimeout(compute, 100)
    const iv = setInterval(compute, 30_000)
    window.addEventListener("resize", compute)
    return () => {
      clearTimeout(timer)
      clearInterval(iv)
      window.removeEventListener("resize", compute)
    }
  }, [compute])

  if (topPx === null) return null

  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: topPx,
        transform: "translateY(-50%)",
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          background: "#2563eb",
          boxShadow: "0 0 0 4px rgba(37,99,235,0.18)",
          border: "2px solid #fff",
        }}
      />
    </div>
  )
}
