
import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function SchedulePage() {
  // データベース（ER 設計）から取得すると想定するモックデータ

  const trips = [
    { id: 'trip-1', title: '志賀高原旅行', start_date: '2026-02-14', end_date: '2026-02-15', created_by: 'user-1' },
  ]

  const plans = [
    { id: 'plan-1', trip_id: 'trip-1', title: 'デフォルトプラン', is_default: true },
  ]

  // ITINERARY_ITEMS を想定したモック。schema に合わせて start_time/end_time を ISO 文字列で保持
  const itineraryItems = [
    { id: 'it-1', plan_id: 'plan-1', is_selected: true, category: 'transport', title: 'ニッポンレンタカー町田駅店', sort_order: 1, start_time: '2026-02-14T07:10:00', end_time: null, estimated_cost: 3000, note: 'レンタカー受取', address: '町田駅', metadata: {} },
    { id: 'it-2', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '相模原愛川IC', sort_order: 2, start_time: '2026-02-14T07:50:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-3', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '八王子JCT', sort_order: 3, start_time: '2026-02-14T08:05:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-4', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '双葉SA', sort_order: 4, start_time: '2026-02-14T09:35:00', end_time: '2026-02-14T09:05:00', estimated_cost: 800, note: 'トイレ・休憩', address: '', metadata: {} },
    { id: 'it-5', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '岡谷JCT', sort_order: 5, start_time: '2026-02-14T10:25:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-6', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '更埴JCT', sort_order: 6, start_time: '2026-02-14T11:15:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-7', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '松代PA', sort_order: 7, start_time: '2026-02-14T12:20:00', end_time: '2026-02-14T11:20:00', estimated_cost: 600, note: '昼食', address: '', metadata: {} },
    { id: 'it-8', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '信州中野IC', sort_order: 8, start_time: '2026-02-14T12:35:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-9', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '志賀高原', sort_order: 9, start_time: null, end_time: null, estimated_cost: 0, note: '到着・観光', address: '', metadata: {} },
  ]

  // groupsMap: 同じアイテム名ごとに Set で時刻を集める Map
  const groupsMap = new Map<string, { item: string; times: Set<string>; note?: string }>()
  const fmtTime = (iso: string | null) => {
    if (!iso) return null
    try {
      const d = new Date(iso)
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      return `${hh}:${mm}`
    } catch {
      return null
    }
  }

  itineraryItems.forEach((it) => {
    const key = it.title
    if (!groupsMap.has(key)) groupsMap.set(key, { item: key, times: new Set<string>(), note: it.note })
    const g = groupsMap.get(key)!
    const s = fmtTime(it.start_time)
    const e = fmtTime(it.end_time)
    if (s) g.times.add(s)
    if (e) g.times.add(e)
  })

  // toMinutes: "HH:MM" 形式の文字列を分単位の数値に変換
  function toMinutes(t: string) {
    const m = t.match(/^(\d{1,2}):(\d{2})$/)
    if (!m) return Number.MAX_SAFE_INTEGER
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
  }

  // groupsWithLabels: 元の rows 配列を走査して、各アイテムに対して発/通過/着ラベル付きの時刻配列を復元
  const groupsWithLabels = Array.from(groupsMap.keys()).map((key) => {
    const g = groupsMap.get(key)!
    const timesSet = g.times
    const labeled: { time: string; label: string }[] = []
    // itineraryItems を走査してラベル（発/着）を復元
    itineraryItems.forEach((it) => {
      if (it.title !== key) return
      const s = fmtTime(it.start_time)
      const e = fmtTime(it.end_time)
      if (s && timesSet.has(s)) labeled.push({ time: s, label: '発' })
      if (e && timesSet.has(e)) labeled.push({ time: e, label: '着' })
    })
    // remove duplicates (同一ラベルと時刻の重複を排除)
    const uniq = Array.from(new Map(labeled.map((t) => [t.label + '|' + t.time, t])).values())
    // 時刻順にソート
    uniq.sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
    return { item: key, times: uniq, note: g.note }
  })

  // groupsWithLabels を最も早い時刻でソートし、タイムラインを時間順に並べる
  groupsWithLabels.sort((a, b) => {
    const aMin = a.times.length ? Math.min(...a.times.map((t) => toMinutes(t.time))) : Number.MAX_SAFE_INTEGER
    const bMin = b.times.length ? Math.min(...b.times.map((t) => toMinutes(t.time))) : Number.MAX_SAFE_INTEGER
    return aMin - bMin
  })

  // styles: インラインスタイルオブジェクト
  const styles: { [k: string]: React.CSSProperties } = {
    page: {
      fontFamily: "Inter, Avenir, Helvetica, 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif",
      padding: '2rem',
      background: 'linear-gradient(180deg,#f7fafc 0%,#fff 40%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
    },
    card: {
      width: '100%',
      maxWidth: 920,
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 10px 30px rgba(16,24,40,0.06)',
      padding: '1.25rem',
      border: '1px solid rgba(16,24,40,0.04)',
    },
    header: { marginBottom: 12 },
    title: { fontSize: 20, fontWeight: 800, color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },
    timeline: { position: 'relative' as const, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 },
    row: { display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', alignItems: 'center' },
    timeBubble: { display: 'inline-block', padding: '6px 10px', borderRadius: 999, background: '#eef2ff', color: '#3730a3', fontWeight: 700, fontSize: 13, minWidth: 56, textAlign: 'center' as const },
    timeStack: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6 },
    timeLine: { display: 'inline-block', padding: '4px 8px', borderRadius: 8, background: '#eef2ff', color: '#3730a3', fontWeight: 700, fontSize: 13, minWidth: 56, textAlign: 'center' as const },
    line: { position: 'absolute' as const, left: 60, top: 12, bottom: 12, width: 2, background: 'linear-gradient(180deg,#c7d2fe,#e0e7ff)' },
    itemWrap: { paddingLeft: 24, position: 'relative' as const },
    dot: { position: 'absolute' as const, left: -12, top: 12, width: 12, height: 12, borderRadius: 999, background: '#6366f1', boxShadow: '0 2px 8px rgba(99,102,241,0.18)' },
    cardItem: { background: '#fff', borderRadius: 10, padding: '10px 14px', boxShadow: '0 6px 18px rgba(2,6,23,0.04)', border: '1px solid rgba(2,6,23,0.04)' },
    itemTitle: { fontWeight: 700, color: '#0f172a', marginBottom: 6 },
    itemNote: { color: '#475569', fontSize: 13 },
    footNote: { marginTop: 14, color: '#94a3b8', fontSize: 13 },
  }

  return (
    <>
      <Header />

      <main style={styles.page}>
        <section style={styles.card}>
        <header style={styles.header}>
          <div style={styles.title}>志賀高原 行程表</div>
          <div style={styles.subtitle}>縦型タイムラインで時間に沿った行程を表示しています</div>
        </header>

        <div style={styles.timeline}>
          <div style={styles.line} />
          {groupsWithLabels.map((g, idx) => (
            <div key={idx} style={{ ...styles.row, margin: '18px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {g.times.length ? (
                  g.times.length > 1 ? (
                    <div style={styles.timeStack}>
                      {g.times.map((t, i) => (
                        <span key={i} style={styles.timeLine}>{t.time}</span>
                      ))}
                    </div>
                  ) : (
                    <span style={styles.timeBubble}>{g.times[0].time}</span>
                  )
                ) : (
                  <span style={{ ...styles.timeBubble, background: '#f1f5f9', color: '#475569' }}>—</span>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <div style={styles.itemWrap}>
                  <div style={styles.cardItem}>
                    <div style={styles.itemTitle}>{g.item}</div>
                    {g.times.length ? (
                      <div style={styles.itemNote}>
                        {g.times.map((t, i) => (
                          <div key={i}>{t.label} {t.time}</div>
                        ))}
                      </div>
                    ) : null}
                    {g.note ? <div style={styles.itemNote}>{g.note}</div> : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footNote}>※ 時刻は目安です。道路状況により変動します。</div>
        </section>
      </main>
      
      <Footer />
    </>
  )
}
