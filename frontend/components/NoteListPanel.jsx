'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getNotes, createNote, deleteNote } from '@/lib/api'

const TYPE_DOT = {
  meeting:  '#a78bfa',
  journal:  '#34d399',
  todo:     '#fbbf24',
  research: '#60a5fa',
  general:  '#AEADA9',
}

export default function NoteListPanel() {
  const router       = useRouter()
  const pathname     = usePathname()
  const queryClient  = useQueryClient()
  const [search, setSearch] = useState('')

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn:  getNotes,
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

  const filtered = notes.filter((n) =>
    !search || (n.title ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className="shrink-0 flex flex-col h-full"
      style={{ width: '256px', background: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ height: '56px', borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notes</span>
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
        ) : filtered.length === 0 ? (
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
            {filtered.map((note) => {
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
                    onClick={(e) => { e.stopPropagation(); remove(note.id) }}
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

      {/* Footer count */}
      <div
        className="px-4 py-2.5 shrink-0"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
