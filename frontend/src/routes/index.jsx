import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotes, createNote, deleteNote } from '../lib/api'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

const NOTE_TYPE_COLORS = {
  meeting:  'bg-purple-100 text-purple-700',
  journal:  'bg-green-100 text-green-700',
  todo:     'bg-yellow-100 text-yellow-700',
  research: 'bg-blue-100 text-blue-700',
  general:  'bg-gray-100 text-gray-600',
}

function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  })

  const { mutate: newNote, isPending: creating } = useMutation({
    mutationFn: () => createNote({ title: 'Untitled', note_type: 'general' }),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      navigate({ to: '/note/$id', params: { id: note.id } })
    },
  })

  const { mutate: remove } = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Notes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => newNote()}
          disabled={creating}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {creating ? 'Creating…' : '+ New Note'}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 h-32 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg">No notes yet</p>
          <p className="text-sm mt-1">Click "+ New Note" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onOpen={() => navigate({ to: '/note/$id', params: { id: note.id } })}
              onDelete={(e) => { e.stopPropagation(); remove(note.id) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NoteCard({ note, onOpen, onDelete }) {
  const badgeClass = NOTE_TYPE_COLORS[note.note_type] ?? NOTE_TYPE_COLORS.general
  const date = new Date(note.updated_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div
      onClick={onOpen}
      className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-medium text-gray-900 line-clamp-2 leading-snug">{note.title || 'Untitled'}</h3>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity text-lg leading-none shrink-0"
        >
          ×
        </button>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
          {note.note_type}
        </span>
        <span className="text-xs text-gray-400">{date}</span>
      </div>
    </div>
  )
}
