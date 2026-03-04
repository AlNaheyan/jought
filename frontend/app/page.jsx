'use client'

import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotes, createNote, deleteNote } from '@/lib/api'

const TYPE_STYLES = {
  meeting:  { dot: 'bg-violet-400',  badge: 'text-violet-600 bg-violet-50 ring-violet-200/60' },
  journal:  { dot: 'bg-emerald-400', badge: 'text-emerald-600 bg-emerald-50 ring-emerald-200/60' },
  todo:     { dot: 'bg-amber-400',   badge: 'text-amber-600 bg-amber-50 ring-amber-200/60' },
  research: { dot: 'bg-blue-400',    badge: 'text-blue-600 bg-blue-50 ring-blue-200/60' },
  general:  { dot: 'bg-zinc-300',    badge: 'text-zinc-500 bg-zinc-50 ring-zinc-200/60' },
}

export default function Dashboard() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Notes</h1>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            {notes.length} document{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => newNote()}
          disabled={creating}
          className="flex items-center gap-1.5 bg-zinc-900 text-white text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          {creating ? 'Creating…' : 'New note'}
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 h-32 animate-pulse">
              <div className="h-3 bg-zinc-100 rounded-full w-3/4 mb-3" />
              <div className="h-2.5 bg-zinc-100 rounded-full w-1/3" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
            <span className="text-zinc-400 text-lg">✦</span>
          </div>
          <p className="text-zinc-500 font-medium">No notes yet</p>
          <p className="text-zinc-400 text-sm mt-1">Click "New note" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onOpen={() => router.push(`/note/${note.id}`)}
              onDelete={(e) => { e.stopPropagation(); remove(note.id) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NoteCard({ note, onOpen, onDelete }) {
  const styles = TYPE_STYLES[note.note_type] ?? TYPE_STYLES.general
  const date = new Date(note.updated_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div
      onClick={onOpen}
      className="group relative rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 hover:shadow-sm cursor-pointer transition-all duration-150"
    >
      {/* Delete btn */}
      <button
        onClick={onDelete}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-zinc-300 hover:text-red-400 transition-all text-base leading-none"
      >
        ×
      </button>

      {/* Title */}
      <h3 className="font-medium text-zinc-900 text-sm leading-snug line-clamp-3 mb-4 pr-4">
        {note.title || 'Untitled'}
      </h3>

      {/* Footer */}
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ring-1 ${styles.badge}`}>
          {note.note_type}
        </span>
        <span className="ml-auto font-mono text-[10px] text-zinc-400">{date}</span>
      </div>
    </div>
  )
}
