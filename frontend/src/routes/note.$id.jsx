import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getNote, updateNote, deleteNote } from '../lib/api'
import Editor from '../components/Editor'

export const Route = createFileRoute('/note/$id')({
  component: NoteEditor,
})

const NOTE_TYPES = ['general', 'meeting', 'journal', 'todo', 'research']

function NoteEditor() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => getNote(id),
  })

  const [title, setTitle] = useState('')
  const [content, setContent] = useState(null)
  const [noteType, setNoteType] = useState('general')
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'unsaved'
  const saveTimer = useRef(null)

  // Populate state from fetched note
  useEffect(() => {
    if (note) {
      setTitle(note.title ?? '')
      setContent(note.content ?? '')
      setNoteType(note.note_type ?? 'general')
    }
  }, [note?.id])

  const { mutate: save } = useMutation({
    mutationFn: (data) => updateNote(id, data),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      setSaveStatus('saved')
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
    onError: () => setSaveStatus('unsaved'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: () => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      navigate({ to: '/' })
    },
  })

  // Auto-save after 1s of inactivity
  const scheduleSave = useCallback((patch) => {
    setSaveStatus('unsaved')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(patch), 1000)
  }, [save])

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
    scheduleSave({ title: e.target.value, note_type: noteType })
  }

  const handleContentChange = (json, text) => {
    setContent(json)
    scheduleSave({ title, content: json, content_plain: text, note_type: noteType })
  }

  const handleTypeChange = (e) => {
    setNoteType(e.target.value)
    scheduleSave({ title, content, note_type: e.target.value })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <select
            value={noteType}
            onChange={handleTypeChange}
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-600 outline-none focus:ring-2 focus:ring-blue-300"
          >
            {NOTE_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <SaveIndicator status={saveStatus} />
          <button
            onClick={() => { if (confirm('Delete this note?')) remove() }}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto px-8 py-8 max-w-3xl mx-auto w-full">
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 outline-none mb-6 bg-transparent"
        />
        <Editor content={content} onChange={handleContentChange} />
      </div>
    </div>
  )
}

function SaveIndicator({ status }) {
  const map = {
    saved:   { text: 'Saved', class: 'text-green-500' },
    saving:  { text: 'Saving…', class: 'text-gray-400' },
    unsaved: { text: 'Unsaved changes', class: 'text-orange-400' },
  }
  const { text, class: cls } = map[status] ?? map.saved
  return <span className={`text-xs ${cls}`}>{text}</span>
}
