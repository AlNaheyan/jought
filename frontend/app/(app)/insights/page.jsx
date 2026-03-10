'use client'

import { useEffect, useState } from 'react'
import { getActivity, getSentiment, getInsightsSummary, getInsightsStats } from '@/lib/api'

// ── Heatmap ────────────────────────────────────────────────────────────────

function buildHeatmapGrid() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Start from 91 days ago, but align to Monday of that week
  const start = new Date(today)
  start.setDate(today.getDate() - 90)
  // Rewind to Monday
  const dow = (start.getDay() + 6) % 7 // 0=Mon…6=Sun
  start.setDate(start.getDate() - dow)

  const days = []
  const cursor = new Date(start)
  while (cursor <= today) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function dateKey(d) {
  return d.toISOString().slice(0, 10)
}

const HEAT_COLORS = [
  'bg-amber-50 border border-amber-100',   // 0
  'bg-amber-200',                           // 1
  'bg-amber-300',                           // 2
  'bg-amber-400',                           // 3
  'bg-amber-600',                           // 4+
]

function heatLevel(count) {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

function ActivityHeatmap({ data }) {
  const countMap = {}
  for (const { date, count } of data) countMap[date] = count

  const days = buildHeatmapGrid()
  // 13 cols (weeks) × 7 rows (Mon–Sun)
  const cols = Math.ceil(days.length / 7)

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2">
        {/* Row labels */}
        <div className="flex flex-col gap-[3px] pt-6">
          {DAY_LABELS.map((d) => (
            <div key={d} className="h-3 text-[10px] font-mono text-zinc-400 leading-none">{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateRows: 'repeat(7, 12px)', gridTemplateColumns: `repeat(${cols}, 12px)` }}
        >
          {days.map((day, i) => {
            const col = Math.floor(i / 7) + 1
            const row = (i % 7) + 1
            const key = dateKey(day)
            const count = countMap[key] ?? 0
            const level = heatLevel(count)
            return (
              <div
                key={key}
                title={`${key}: ${count} note${count !== 1 ? 's' : ''}`}
                className={`rounded-sm w-3 h-3 cursor-default transition-opacity hover:opacity-70 ${HEAT_COLORS[level]}`}
                style={{ gridColumn: col, gridRow: row }}
              />
            )
          })}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="font-mono text-[10px] text-zinc-400">Less</span>
        {HEAT_COLORS.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span className="font-mono text-[10px] text-zinc-400">More</span>
      </div>
    </div>
  )
}

// ── Sentiment Chart ────────────────────────────────────────────────────────

function SentimentChart({ data }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-32 font-mono text-xs text-zinc-400">
        No sentiment data yet — write some notes!
      </div>
    )
  }

  const W = 480
  const H = 140
  const PAD = { top: 12, right: 12, bottom: 24, left: 32 }

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const xScale = (i) => PAD.left + (i / (data.length - 1 || 1)) * innerW
  const yScale = (s) => PAD.top + ((1 - s) / 2) * innerH  // score 1→top, -1→bottom

  const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.score), score: d.score, title: d.title, date: d.date }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  // Color segments
  const segments = []
  for (let i = 0; i < points.length - 1; i++) {
    const avg = (points[i].score + points[i + 1].score) / 2
    segments.push({
      x1: points[i].x, y1: points[i].y,
      x2: points[i + 1].x, y2: points[i + 1].y,
      color: avg >= 0 ? '#16a34a' : '#dc2626',
    })
  }

  const zeroY = yScale(0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 160 }}>
      {/* Zero line */}
      <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY} stroke="#e4e4e7" strokeWidth={1} strokeDasharray="4,3" />
      {/* Y axis labels */}
      <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fontSize={9} fill="#a1a1aa" fontFamily="monospace">+1</text>
      <text x={PAD.left - 4} y={zeroY + 4} textAnchor="end" fontSize={9} fill="#a1a1aa" fontFamily="monospace">0</text>
      <text x={PAD.left - 4} y={H - PAD.bottom + 4} textAnchor="end" fontSize={9} fill="#a1a1aa" fontFamily="monospace">-1</text>
      {/* Colored segments */}
      {segments.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.color} strokeWidth={2} strokeLinecap="round" />
      ))}
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={p.score >= 0 ? '#16a34a' : '#dc2626'}>
          <title>{p.date} — {p.title}: {p.score.toFixed(2)}</title>
        </circle>
      ))}
      {/* X axis: first and last date */}
      {data.length > 0 && (
        <>
          <text x={PAD.left} y={H - 4} fontSize={9} fill="#a1a1aa" fontFamily="monospace">{data[0].date}</text>
          <text x={W - PAD.right} y={H - 4} textAnchor="end" fontSize={9} fill="#a1a1aa" fontFamily="monospace">{data[data.length - 1].date}</text>
        </>
      )}
    </svg>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ value, label, loading }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col gap-1">
      {loading ? (
        <div className="h-8 w-16 bg-zinc-100 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-semibold text-zinc-900 tracking-tight">{value}</p>
      )}
      <p className="font-mono text-xs text-zinc-400">{label}</p>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Insights() {
  const [activity, setActivity] = useState([])
  const [sentimentData, setSentimentData] = useState([])
  const [stats, setStats] = useState(null)
  const [summaryText, setSummaryText] = useState('')
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      getActivity(),
      getSentiment(),
      getInsightsStats(),
    ])
      .then(([act, sent, st]) => {
        setActivity(act)
        setSentimentData(sent)
        setStats(st)
      })
      .catch((e) => setError(e?.message ?? 'Failed to load insights'))
      .finally(() => setLoading(false))

    getInsightsSummary()
      .then((d) => setSummaryText(d.summary))
      .catch(() => setSummaryText('Could not generate summary.'))
      .finally(() => setSummaryLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Insights</h1>
        <p className="font-mono text-xs text-zinc-400 mt-1">patterns in your knowledge base</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-mono text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard value={stats?.total_notes ?? '—'} label="total notes" loading={loading} />
        <StatCard value={stats?.notes_this_week ?? '—'} label="this week" loading={loading} />
        <StatCard value={stats?.top_note_type ?? '—'} label="top type" loading={loading} />
        <StatCard
          value={stats ? (stats.total_words >= 1000 ? `${(stats.total_words / 1000).toFixed(1)}k` : stats.total_words) : '—'}
          label="total words"
          loading={loading}
        />
      </div>

      {/* Activity heatmap */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 mb-6">
        <p className="text-sm font-medium text-zinc-700 mb-4">Activity — last 13 weeks</p>
        {loading ? (
          <div className="h-20 bg-zinc-50 rounded animate-pulse" />
        ) : (
          <ActivityHeatmap data={activity} />
        )}
      </div>

      {/* Sentiment + Weekly summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm font-medium text-zinc-700 mb-4">Sentiment trend</p>
          {loading ? (
            <div className="h-32 bg-zinc-50 rounded animate-pulse" />
          ) : (
            <SentimentChart data={sentimentData} />
          )}
          <div className="mt-3 flex gap-4">
            <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
              <span className="inline-block w-3 h-0.5 bg-green-600 rounded" /> positive
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
              <span className="inline-block w-3 h-0.5 bg-red-600 rounded" /> negative
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm font-medium text-zinc-700 mb-4">Weekly summary</p>
          {summaryLoading ? (
            <div className="space-y-2">
              <div className="h-3 bg-zinc-100 rounded animate-pulse w-full" />
              <div className="h-3 bg-zinc-100 rounded animate-pulse w-5/6" />
              <div className="h-3 bg-zinc-100 rounded animate-pulse w-4/6" />
              <div className="h-3 bg-zinc-100 rounded animate-pulse w-full mt-3" />
              <div className="h-3 bg-zinc-100 rounded animate-pulse w-3/4" />
            </div>
          ) : (
            <p className="font-mono text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">{summaryText}</p>
          )}
        </div>
      </div>
    </div>
  )
}
