export type ShareInput = { user_id: string; ratio?: number; fixed?: number }

export function distribute(amount: number, shares: ShareInput[], method: "equal" | "ratio" | "fixed", payerId?: string) {
  const n = shares.length
  let results: { user_id: string; amount_owed: number }[] = []

  if (method === "equal") {
    const base = Math.floor(amount / n)
    results = shares.map((s) => ({ user_id: s.user_id, amount_owed: base }))
    const total = base * n
    let remainder = amount - total
    // 余りは payerId があれば最優先で、それ以外は先頭から割当
    while (remainder > 0) {
      const idx = payerId ? shares.findIndex((s) => s.user_id === payerId) : 0
      const target = idx >= 0 ? idx : 0
      results[target].amount_owed += 1
      // move payer to next index if multiple remainders
      if (!payerId) shares.push(shares.shift()!)
      remainder--
    }
  } else if (method === "ratio") {
    const sumRatio = shares.reduce((s, x) => s + (x.ratio ?? 0), 0) || 1
    let total = 0
    results = shares.map((s) => {
      const val = Math.floor(((s.ratio ?? 0) / sumRatio) * amount)
      total += val
      return { user_id: s.user_id, amount_owed: val }
    })
    const remainder = amount - total
    for (let i = 0; i < remainder; i++) results[i % n].amount_owed += 1
  } else {
    // fixed: assume caller provided correct fixed amounts; if mismatch, attach diff to payer
    results = shares.map((s) => ({ user_id: s.user_id, amount_owed: s.fixed ?? 0 }))
    const total = results.reduce((s, r) => s + r.amount_owed, 0)
    const diff = amount - total
    if (diff !== 0) {
      const idx = shares.findIndex((s) => s.user_id === payerId) >= 0 ? shares.findIndex((s) => s.user_id === payerId) : 0
      results[idx].amount_owed += diff
    }
  }

  return results
}
