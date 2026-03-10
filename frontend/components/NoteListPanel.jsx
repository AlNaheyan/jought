'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { getNotes, createNote, deleteNote } from '@/lib/api'
import { UserButton } from '@clerk/nextjs'

const TYPE_DOT = {
  meeting:  '#a78bfa',
  journal:  '#34d399',
  todo:     '#fbbf24',
  research: '#60a5fa',
  general:  '#AEADA9',
}

const bottomNav = [
  { href: '/insights', label: 'Insights', icon: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M12 12V7.5M7.5 12V3M3 12V8.5" />
    </svg>
  )},
  { href: '/graph', label: 'Graph', icon: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="7" cy="7" r="2" />
      <circle cx="2.5" cy="4.5" r="1.25" />
      <circle cx="12" cy="4.5" r="1.25" />
      <circle cx="5" cy="12" r="1.25" />
      <path d="M3.5 5.5l2.5 1M10.5 5.5l-2.5 1M6 9.5l.5-1" />
    </svg>
  )},
  { href: '/settings', label: 'Settings', icon: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="2" />
      <path d="M11.8 9a1.1 1.1 0 00.22 1.22l.04.04a1.35 1.35 0 01-1.91 1.91l-.04-.04a1.1 1.1 0 00-1.22-.22 1.1 1.1 0 00-.68 1.03v.06a1.35 1.35 0 01-2.7 0v-.03a1.1 1.1 0 00-.73-1.03 1.1 1.1 0 00-1.22.22l-.04.04a1.35 1.35 0 01-1.91-1.91l.04-.04a1.1 1.1 0 00.22-1.22A1.1 1.1 0 001.04 8.2H1a1.35 1.35 0 010-2.7h.03a1.1 1.1 0 001.03-.73 1.1 1.1 0 00-.22-1.22l-.04-.04a1.35 1.35 0 011.91-1.91l.04.04a1.1 1.1 0 001.22.22A1.1 1.1 0 005.7 1.04V1a1.35 1.35 0 012.7 0v.03a1.1 1.1 0 00.68 1.03 1.1 1.1 0 001.22-.22l.04-.04a1.35 1.35 0 011.91 1.91l-.04.04a1.1 1.1 0 00-.22 1.22 1.1 1.1 0 001.03.68H13a1.35 1.35 0 010 2.7h-.03a1.1 1.1 0 00-1.17.65z" />
    </svg>
  )},
]

export default function NoteListPanel() {
  const router       = useRouter()
  const pathname     = usePathname()
  const queryClient  = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', debouncedSearch],
    queryFn:  () => getNotes(debouncedSearch ? { search: debouncedSearch } : undefined),
  })

  const { mutate: newNote, isPending: creating } = useMutation({
    mutationFn: () => createNote({ title: 'Untitled', note_type: 'general' }),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      router.push(`/note/${note.id}`)
    },
  })

  const { mutate: remove } = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const activeId = pathname.startsWith('/note/') ? pathname.split('/note/')[1] : null

  return (
    <div
      className="shrink-0 flex flex-col h-full"
      style={{ width: '256px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ height: '56px', borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <span className="text-white text-[11px] font-display italic font-bold leading-none">J</span>
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Jought
          </span>
        </Link>
        <button
          onClick={() => newNote()}
          disabled={creating}
          title="New note"
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7.5 2.5v10M2.5 7.5h10" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{ background: 'var(--bg-hover)' }}
        >
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
            <circle cx="4.5" cy="4.5" r="3.5" />
            <path d="M7.5 7.5l2.5 2.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="bg-transparent text-[12px] outline-none w-full"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto py-1">
        {isLoading ? (
          <div className="px-2 pt-1 space-y-0.5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg animate-pulse"
                style={{ background: 'var(--bg-hover)' }}
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              {search ? 'No notes match' : 'No notes yet'}
            </p>
            {!search && (
              <button
                onClick={() => newNote()}
                className="text-[11px] mt-2 transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                Create your first note →
              </button>
            )}
          </div>
        ) : (
          <div className="px-2 py-1 space-y-0.5">
            {notes.map((note) => {
              const isActive  = note.id === activeId
              const dot       = TYPE_DOT[note.note_type] ?? TYPE_DOT.general
              const date      = new Date(note.updated_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric',
              })

              return (
                <div
                  key={note.id}
                  onClick={() => router.push(`/note/${note.id}`)}
                  className="group relative flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                  style={{ background: isActive ? 'var(--bg-active)' : 'transparent' }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-[5px]"
                    style={{ background: dot }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[12px] truncate"
                      style={{
                        color: 'var(--text-primary)',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {note.title || 'Untitled'}
                    </p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {date}
                    </p>
                  </div>

                  {/* Delete on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm(`Delete "${note.title || 'Untitled'}"? This cannot be undone.`)) {
                        remove(note.id)
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 shrink-0 w-4 h-4 flex items-center justify-center transition-all mt-0.5"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 1l7 7M8 1L1 8" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom nav + account */}
      <div className="shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="px-2 py-2 space-y-0.5">
          {bottomNav.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors"
                style={{
                  background: active ? 'var(--bg-active)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}}
              >
                {icon}
                {label}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-2.5 px-5 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
          <UserButton afterSignOutUrl="/sign-in" />
          <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>Account</span>
        </div>
      </div>
    </div>
  )
}
