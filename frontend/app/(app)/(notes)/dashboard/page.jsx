'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getNotes, getInsightsStats, createNote } from '@/lib/api'

// ── Note type dot colors ────────────────────────────────────────────────────

const TYPE_DOT = {
  meeting:  '#a78bfa',
  journal:  '#34d399',
  todo:     '#fbbf24',
  research: '#60a5fa',
  general:  '#AEADA9',
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Skeleton primitives ─────────────────────────────────────────────────────

function Skeleton({ className, style }) {
  return (
    <div
      className={`animate-pulse rounded ${className ?? ''}`}
      style={{ background: 'var(--bg-hover)', ...style }}
    />
  )
}

// ── Stat card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, loading, icon }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-5"
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </span>
        <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {value ?? '—'}
        </p>
      )}
    </div>
  )
}

// ── Note card skeleton ───────────────────────────────────────────────────────

function NoteCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-4"
      style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
    >
      <Skeleton className="h-3 w-16 rounded-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

// ── Note card ────────────────────────────────────────────────────────────────

function NoteCard({ note, onClick }) {
  const type = note.note_type ?? 'general'
  const dot  = TYPE_DOT[type] ?? TYPE_DOT.general

  return (
    <button
      onClick={onClick}
      className="text-left flex flex-col gap-2.5 rounded-xl p-4 transition-all outline-none group"
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-hover)'
        e.currentTarget.style.borderColor = 'var(--border-strong)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-panel)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Type pill */}
      <span
        className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full w-fit capitalize"
        style={{
          background: 'var(--bg-active)',
          color: 'var(--text-secondary)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: dot }}
        />
        {type}
      </span>

      {/* Title */}
      <p
        className="text-sm font-medium leading-snug line-clamp-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {note.title?.trim() || 'Untitled'}
      </p>

      {/* Date */}
      <p className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
        {formatDate(note.updated_at)}
      </p>
    </button>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate, creating }) {
  return (
    <div
      className="col-span-2 flex flex-col items-center justify-center py-16 px-8 text-center rounded-xl"
      style={{ border: '1px dashed var(--border)' }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--accent-light)' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <p className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
        No notes yet
      </p>
      <p className="text-xs font-mono mb-6" style={{ color: 'var(--text-tertiary)' }}>
        Create your first note to get started.
      </p>
      <button
        onClick={onCreate}
        disabled={creating}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ background: 'var(--text-primary)', color: '#F9F7F1' }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        {creating ? (
          <span
            className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(249,247,241,0.3)', borderTopColor: '#F9F7F1' }}
          />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
        New note
      </button>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter()

  const [notes, setNotes]   = useState([])
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const n = await getNotes({ limit: 8 })
        setNotes(n)
      } catch (e) {
        setError(e?.message ?? 'Failed to load notes')
      }
      try {
        const s = await getInsightsStats()
        setStats(s)
      } catch {
        // Stats are non-critical — dashboard still works without them
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const note = await createNote({ title: '', note_type: 'general' })
      router.push(`/note/${note.id}`)
    } catch {
      setCreating(false)
    }
  }

  const topType = stats?.top_note_type
  const topTypeDot = topType ? (TYPE_DOT[topType] ?? TYPE_DOT.general) : null

  return (
    <div
      className="h-full overflow-auto"
      style={{ background: 'var(--bg-editor)' }}
    >
      <div className="max-w-3xl mx-auto px-8 py-12">

        {/* ── Greeting header ── */}
        <div className="mb-10">
          <h1
            className="text-2xl font-semibold tracking-tight mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {getGreeting()}
          </h1>
          <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div
            className="mb-8 rounded-xl px-4 py-3 text-xs font-mono"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
          >
            {error}
          </div>
        )}

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <StatCard
            label="Total notes"
            value={stats?.total_notes}
            loading={loading}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            }
          />
          <StatCard
            label="This week"
            value={stats?.notes_this_week}
            loading={loading}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />
          <StatCard
            label="Top type"
            loading={loading}
            value={
              topType ? (
                <span className="flex items-center gap-2">
                  {topTypeDot && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: topTypeDot }}
                    />
                  )}
                  <span className="capitalize">{topType}</span>
                </span>
              ) : null
            }
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          />
        </div>

        {/* ── Recent notes header ── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent notes</h2>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              last 8 updated
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {creating ? (
              <span
                className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin"
              />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
            New note
          </button>
        </div>

        {/* ── Notes grid ── */}
        <div className="grid grid-cols-2 gap-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <NoteCardSkeleton key={i} />)
          ) : notes.length === 0 ? (
            <EmptyState onCreate={handleCreate} creating={creating} />
          ) : (
            notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => router.push(`/note/${note.id}`)}
              />
            ))
          )}
        </div>

      </div>
    </div>
  )
}
