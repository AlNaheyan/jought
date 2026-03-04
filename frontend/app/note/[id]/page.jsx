'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getNote, updateNote, deleteNote } from '@/lib/api'
import Editor from '@/components/Editor'

const NOTE_TYPES = ['general', 'meeting', 'journal', 'todo', 'research']

const SAVE_STATUS = {
  saved:   { label: 'saved',   cls: 'text-emerald-500' },
  saving:  { label: 'saving…', cls: 'text-zinc-400' },
  unsaved: { label: 'unsaved', cls: 'text-amber-500' },
}

export default function NoteEditor() {
  const { id } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => getNote(id),
  })

  const [title, setTitle] = useState('')
  const [content, setContent] = useState(null)
  const [noteType, setNoteType] = useState('general')
  const [saveStatus, setSaveStatus] = useState('saved')
  const saveTimer = useRef(null)

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
      router.push('/')
    },
  })

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
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin" />
      </div>
    )
  }

  const { label, cls } = SAVE_STATUS[saveStatus] ?? SAVE_STATUS.saved

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 h-12 border-b border-zinc-100 sticky top-0 z-10 bg-white/80 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-700 text-sm transition-colors"
        >
          <span>←</span>
          <span>Notes</span>
        </Link>
        <div className="flex items-center gap-5">
          <select
            value={noteType}
            onChange={handleTypeChange}
            className="text-xs text-zinc-400 bg-transparent border-0 outline-none cursor-pointer hover:text-zinc-700 transition-colors font-mono"
          >
            {NOTE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className={`font-mono text-[11px] ${cls}`}>{label}</span>
          <button
            onClick={() => { if (confirm('Delete this note?')) remove() }}
            className="text-xs text-zinc-300 hover:text-red-400 transition-colors"
          >
            delete
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-8 py-12">
          <input
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="w-full text-[2rem] font-bold text-zinc-900 placeholder-zinc-200 outline-none mb-8 bg-transparent leading-tight tracking-tight"
          />
          <Editor content={content} onChange={handleContentChange} />
        </div>
      </div>
    </div>
  )
}
