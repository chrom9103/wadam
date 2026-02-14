import React from 'react'
import Header from '../../../../components/Header'
import Footer from '../../../../components/Footer'

// Dynamic route page: /trips/[trip]/[plan]/schedule
export default async function SchedulePage({ params }: { params: Promise<{ trip: string; plan: string }> | { trip: string; plan: string } }) {
  const { trip: tripSlug, plan: planId } = await params

  // データベース（ER 設計）から取得すると想定するモックデータ
  const trips = [
    { id: 'trip-1', slug: 'shigaKogen-spr-2026', title: '志賀高原旅行', start_date: '2026-02-14', end_date: '2026-02-15', created_by: 'user-1' },
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
  const groupsMap = new Map<string, { id: string; item: string; times: Set<string>; note?: string; sort_order?: number }>()
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

  // グルーピングは title ではなく id をキーにしつつ、表示用に title を保持する
  itineraryItems.forEach((it) => {
    const key = it.id
    if (!groupsMap.has(key)) groupsMap.set(key, { id: it.id, item: it.title, times: new Set<string>(), note: it.note, sort_order: it.sort_order })
    const g = groupsMap.get(key)!
    const s = fmtTime(it.start_time)
    const e = fmtTime(it.end_time)
    if (s) g.times.add(s)
    if (e) g.times.add(e)
  })

  // groupsWithLabels: 各アイテムに対して、start_time は "発" または category によるラベルを付与、end_time は "着"
  const groupsWithLabels = Array.from(groupsMap.values()).map((g) => {
    const labeled: { time: string; label: string }[] = []
    // 元データからラベルを復元するため itineraryItems を検索
    itineraryItems.forEach((it) => {
      if (it.id !== g.id) return
      const s = fmtTime(it.start_time)
      const e = fmtTime(it.end_time)
      if (s && g.times.has(s)) {
        const startLabel = it.category === 'pass' ? '通過' : '発'
        labeled.push({ time: s, label: startLabel })
      }
      if (e && g.times.has(e)) labeled.push({ time: e, label: '着' })
    })
    // 重複除去 + 時刻順ソート
    const uniq = Array.from(new Map(labeled.map((t) => [t.label + '|' + t.time, t])).values())
    uniq.sort((a, b) => {
      const am = a.time.match(/^(\d{1,2}):(\d{2})$/)
      const bm = b.time.match(/^(\d{1,2}):(\d{2})$/)
      const av = am ? parseInt(am[1], 10) * 60 + parseInt(am[2], 10) : Number.MAX_SAFE_INTEGER
      const bv = bm ? parseInt(bm[1], 10) * 60 + parseInt(bm[2], 10) : Number.MAX_SAFE_INTEGER
      return av - bv
    })
    return { id: g.id, item: g.item, times: uniq, note: g.note, sort_order: g.sort_order }
  })

  // sort_order がある場合はそれを優先し、無ければ最小時刻でソート
  groupsWithLabels.sort((a, b) => {
    const aOrder = typeof a.sort_order === 'number' ? a.sort_order : Number.MAX_SAFE_INTEGER
    const bOrder = typeof b.sort_order === 'number' ? b.sort_order : Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder
    const aMin = a.times.length ? parseInt(a.times[0].time.split(':')[0], 10) * 60 + parseInt(a.times[0].time.split(':')[1], 10) : Number.MAX_SAFE_INTEGER
    const bMin = b.times.length ? parseInt(b.times[0].time.split(':')[0], 10) * 60 + parseInt(b.times[0].time.split(':')[1], 10) : Number.MAX_SAFE_INTEGER
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
    row: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', alignItems: 'center' },
    timeBubble: { display: 'inline-block', padding: '6px 10px', borderRadius: 999, background: '#eef2ff', color: '#3730a3', fontWeight: 700, fontSize: 13, minWidth: 56, textAlign: 'center' as const },
    timeStack: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6 },
    timeLine: { display: 'inline-block', padding: '4px 8px', borderRadius: 8, background: '#eef2ff', color: '#3730a3', fontWeight: 700, fontSize: 13, minWidth: 56, textAlign: 'center' as const },
    line: { position: 'absolute' as const, left: 70, top: 12, bottom: 12, width: 2, background: 'linear-gradient(180deg,#c7d2fe,#e0e7ff)' },
    itemWrap: { paddingLeft: 24, position: 'relative' as const },
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
            <div style={styles.title}>{`トリップ: ${tripSlug} / プラン: ${planId}`}</div>
            <div style={styles.subtitle}>縦型タイムラインで時間に沿った行程を表示しています</div>
          </header>

          <div style={styles.timeline}>
            <div style={styles.line} />
            {groupsWithLabels.map((g, idx) => (
              <div key={g.id} style={{ ...styles.row, margin: '18px 0' }}>
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
