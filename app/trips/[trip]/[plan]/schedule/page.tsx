import React from 'react'
import Header from '../../../../components/Header'
import Footer from '../../../../components/Footer'

// Dynamic route page: /trips/[trip]/[plan]/schedule
export default async function SchedulePage({ params }: { params: Promise<{ trip: string; plan: string }> | { trip: string; plan: string } }) {
  const { trip: tripSlug, plan: planId } = await params

  // データベース（ER 設計）から取得すると想定するモックデータ
  const trips = [
    { id: 'trip-1', slug: 'shigaKogen-spr-2026', title: '志賀高原旅行', start_date: '2026-02-16', end_date: '2026-02-20', created_by: 'user-1' },
  ]

  const plans = [
    { id: 'plan-1', trip_id: 'trip-1', title: 'デフォルトプラン', is_default: true },
  ]

  // ITINERARY_ITEMS を想定したモック。schema に合わせて start_time/end_time を ISO 文字列で保持
  const itineraryItems = [
    { id: 'it-1', plan_id: 'plan-1', is_selected: true, category: 'spot', title: 'ニッポンレンタカー町田駅店', sort_order: 1, start_time: '2026-02-16T07:10:00', end_time: null, estimated_cost: 3000, note: 'レンタカー受取', address: '町田駅', metadata: {} },
    { id: 'it-2', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '県道52号', sort_order: 2, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-3', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '相模原愛川IC', sort_order: 3, start_time: '2026-02-16T07:50:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-4', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '圏央道', sort_order: 4, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-5', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '八王子JCT', sort_order: 5, start_time: '2026-02-16T08:05:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-6', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '中央自動車道', sort_order: 6, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-7', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '双葉SA', sort_order: 7, start_time: '2026-02-16T09:05:00', end_time: '2026-02-16T09:35:00', estimated_cost: 800, note: 'トイレ・休憩', address: '', metadata: {} },
    { id: 'it-8', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '中央自動車道', sort_order: 8, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-9', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '岡谷JCT', sort_order: 9, start_time: '2026-02-16T10:25:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-10', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '中央自動車道', sort_order: 10, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-11', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '更埴JCT', sort_order: 11, start_time: '2026-02-16T11:15:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-12', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '松代PA', sort_order: 12, start_time: '2026-02-16T11:20:00', end_time: '2026-02-16T12:20:00', estimated_cost: 600, note: '昼食', address: '', metadata: {} },
    { id: 'it-13', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '信州中野IC', sort_order: 13, start_time: '2026-02-16T12:35:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-14', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '国道292号, 県道471号', sort_order: 14, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-15', plan_id: 'plan-1', is_selected: true, category: 'spot', title: 'ダイヤモンド志賀', sort_order: 15, start_time: '2026-02-16T13:15:00', end_time: '2026-02-16T13:30:00', estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-16', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '徒歩', sort_order: 16, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-17', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '志賀高原 一の瀬ファミリースキー場', sort_order: 17, start_time: '2026-02-16T13:40:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    // --- 翌日（例）スキー予定 ---
    { id: 'it-18', plan_id: 'plan-1', is_selected: true, category: 'spot', title: 'ダイヤモンド志賀（翌日）', sort_order: 18, start_time: '2026-02-17T10:00:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-19', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '徒歩', sort_order: 19, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-20', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '志賀高原 一の瀬ファミリースキー場（翌日）', sort_order: 20, start_time: '2026-02-17T10:10:00', end_time: '2026-02-17T17:50:00', estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-21', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '徒歩移動（帰路）', sort_order: 21, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-22', plan_id: 'plan-1', is_selected: true, category: 'spot', title: 'ダイヤモンド志賀（帰着）', sort_order: 22, start_time: '2026-02-17T18:00:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
        // --- 翌日（例）スキー予定 ---
    { id: 'it-18', plan_id: 'plan-1', is_selected: true, category: 'spot', title: 'ダイヤモンド志賀（翌日）', sort_order: 18, start_time: '2026-02-18T10:00:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-19', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '徒歩', sort_order: 19, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-20', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '志賀高原 一の瀬ファミリースキー場（翌日）', sort_order: 20, start_time: '2026-02-18T10:10:00', end_time: '2026-02-18T17:50:00', estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-21', plan_id: 'plan-1', is_selected: true, category: 'transport', title: '徒歩移動（帰路）', sort_order: 21, start_time: null, end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-22', plan_id: 'plan-1', is_selected: true, category: 'spot', title: 'ダイヤモンド志賀（帰着）', sort_order: 22, start_time: '2026-02-18T18:00:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    // --- 帰路 ---
    { id: 'it-23', plan_id: 'plan-1', is_selected: true, category: 'spot', title: 'ダイヤモンド志賀（出発）', sort_order: 23, start_time: '2026-02-19T14:00:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-24', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '道の駅北信州やまのうち（到着）', sort_order: 24, start_time: '2026-02-19T14:35:00', end_time: '2026-02-19T15:05:00', estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-25', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '信州中野IC', sort_order: 25, start_time: '2026-02-19T15:20:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-26', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '更埴JCT', sort_order: 26, start_time: '2026-02-19T15:40:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-27', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '岡谷JCT', sort_order: 27, start_time: '2026-02-19T16:35:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-28', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '諏訪湖SA（到着）', sort_order: 28, start_time: '2026-02-19T16:40:00', end_time: '2026-02-19T17:10:00', estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-29', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '談合坂SA（到着）', sort_order: 29, start_time: '2026-02-19T18:40:00', end_time: '2026-02-19T19:40:00', estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-30', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '八王子JCT', sort_order: 30, start_time: '2026-02-19T20:00:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-31', plan_id: 'plan-1', is_selected: true, category: 'pass', title: '相模原愛川IC', sort_order: 31, start_time: '2026-02-19T20:40:00', end_time: null, estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-32', plan_id: 'plan-1', is_selected: true, category: 'spot', title: '出光16合鵜野森SS（給油）', sort_order: 32, start_time: '2026-02-19T21:00:00', end_time: '2026-02-19T21:20:00', estimated_cost: 0, note: '', address: '', metadata: {} },
    { id: 'it-33', plan_id: 'plan-1', is_selected: true, category: 'spot', title: 'ニッポンレンタカー町田駅店（返却）', sort_order: 33, start_time: '2026-02-19T21:30:00', end_time: null, estimated_cost: 0, note: 'レンタカー返却', address: '町田駅', metadata: {} },
  ]

  // groupsMap: 同じアイテム名ごとに Set で時刻を集める Map
  const groupsMap = new Map<string, { id: string; item: string; times: Set<string>; dates: Set<string>; note?: string; sort_order?: number; category?: string }>()
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
  const fmtDate = (iso: string | null) => {
    if (!iso) return null
    try {
      const d = new Date(iso)
      // YYYY-MM-DD
      return d.toISOString().slice(0, 10)
    } catch {
      return null
    }
  }

  // グルーピングは title ではなく id をキーにしつつ、表示用に title を保持する
  itineraryItems.forEach((it) => {
    const key = it.id
    if (!groupsMap.has(key)) groupsMap.set(key, { id: it.id, item: it.title, times: new Set<string>(), dates: new Set<string>(), note: it.note, sort_order: it.sort_order, category: it.category })
    const g = groupsMap.get(key)!
    const s = fmtTime(it.start_time)
    const e = fmtTime(it.end_time)
    const sd = fmtDate(it.start_time)
    // 日付は start_time のみを使用する（end_time の日付は使わない）
    if (s) g.times.add(s)
    if (e) g.times.add(e)
    if (sd) g.dates.add(sd)
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
    // pick a representative date (earliest) if available
    const date = g.dates.size ? Array.from(g.dates).sort()[0] : null
    return { id: g.id, item: g.item, times: uniq, note: g.note, sort_order: g.sort_order, category: g.category, date }
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
    // transport-specific styles
    transportRow: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', alignItems: 'center', margin: '12px 0' },
    transportTime: { color: '#64748b', fontSize: 13, display: 'flex', justifyContent: 'flex-end' },
    transportText: { color: '#475569', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 },
    divider: { gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' },
    dividerLine: { height: 1, background: '#e6eef8', width: '100%' },
    dividerLabel: { position: 'absolute', background: '#fff', padding: '4px 12px', borderRadius: 999, color: '#64748b', fontSize: 13, border: '1px solid #eef2ff' },
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
            {(() => {
              const nodes: React.ReactNode[] = []
              let lastDate: string | null = null
              groupsWithLabels.forEach((g) => {
                if (g.date && g.date !== lastDate) {
                  nodes.push(
                    <div key={`d-${g.date}`} style={styles.divider}>
                      <div style={styles.dividerLine} />
                      <div style={styles.dividerLabel}>{new Date(g.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}</div>
                    </div>
                  )
                  lastDate = g.date
                }

                if (g.category === 'transport') {
                  nodes.push(
                    <div key={g.id} style={styles.transportRow}>
                      <div style={styles.transportTime}>移動</div>
                      <div style={styles.transportText}>{g.item}</div>
                    </div>
                  )
                } else {
                  nodes.push(
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
                            <span style={styles.timeLine}>{g.times[0].time}</span>
                          )
                        ) : null}
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
                  )
                }
              })
              return nodes
            })()}
          </div>

          <div style={styles.footNote}>※ 時刻は目安です。道路状況により変動します。</div>
        </section>
      </main>
      
      <Footer />
    </>
  )
}
