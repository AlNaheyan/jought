'use client'

import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getNote, updateNote, deleteNote } from '@/lib/api'
import Editor from '@/components/Editor'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Check, ChevronDown, Trash2, Clock, FileText } from 'lucide-react'

/* ── Types ── */
const NOTE_TYPES = ['general', 'meeting', 'journal', 'todo', 'research']

const TYPE_META = {
  meeting:  { dot: '#a78bfa', bg: '#EDE9FE', color: '#6D28D9' },
  journal:  { dot: '#34d399', bg: '#ECFDF5', color: '#059669' },
  todo:     { dot: '#fbbf24', bg: '#FFFBEB', color: '#B45309' },
  research: { dot: '#60a5fa', bg: '#EFF6FF', color: '#1D4ED8' },
  general:  { dot: '#AEADA9', bg: 'var(--bg-hover)', color: 'var(--text-secondary)' },
}

const SAVE_STATE = {
  saved:   { label: 'Saved',    color: '#10b981' },
  saving:  { label: 'Saving…',  color: 'var(--text-tertiary)' },
  unsaved: { label: 'Unsaved',  color: '#f59e0b' },
}

/* ── Word count helper ── */
function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function NoteEditor() {
  const { id }      = useParams()
  const router      = useRouter()
  const queryClient = useQueryClient()

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn:  () => getNote(id),
  })

  const [title,      setTitle]      = useState('')
  const [content,    setContent]    = useState(null)
  const [noteType,   setNoteType]   = useState('general')
  const [saveStatus, setSaveStatus] = useState('saved')
  const [words,      setWords]      = useState(0)
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
    onMutate:   () => setSaveStatus('saving'),
    onSuccess:  () => {
      setSaveStatus('saved')
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
    onError: () => setSaveStatus('unsaved'),
  })

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: () => deleteNote(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      router.push('/dashboard')
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
    setWords(wordCount(text))
    scheduleSave({ title, content: json, content_plain: text, note_type: noteType })
  }

  const handleTypeChange = (type) => {
    setNoteType(type)
    scheduleSave({ title, content, note_type: type })
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className="w-4 h-4 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
        />
      </div>
    )
  }

  const meta = TYPE_META[noteType] ?? TYPE_META.general
  const save_state = SAVE_STATE[saveStatus] ?? SAVE_STATE.saved
  const updatedAt = note?.updated_at
    ? new Date(note.updated_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 bg-white/92"
        style={{ height: '48px', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}
      >
        {/* Left: note type dropdown */}
        <NoteTypeDropdown
          value={noteType}
          onChange={handleTypeChange}
          meta={meta}
        />

        {/* Right: status + delete */}
        <div className="flex items-center gap-4">
          {/* Save status */}
          <span
            className="text-[11px] font-mono tabular-nums"
            style={{ color: save_state.color }}
          >
            {save_state.label}
          </span>

          {/* Delete dialog */}
          <DeleteDialog onConfirm={() => remove()} deleting={deleting} />
        </div>
      </div>

      {/* ── Editor area ── */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[700px] mx-auto px-10 pt-10 pb-24">

          {/* Title */}
          <input
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="w-full bg-transparent outline-none font-mono font-bold leading-tight mb-2"
            style={{
              fontSize: '1.875rem',
              color: 'var(--text-primary)',
              caretColor: 'var(--accent)',
            }}
          />

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-8">
            {updatedAt && (
              <span className="flex items-center gap-1 text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                <Clock size={10} />
                {updatedAt}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
              <FileText size={10} />
              {words} {words === 1 ? 'word' : 'words'}
            </span>
          </div>

          <Editor content={content} onChange={handleContentChange} />
        </div>
      </div>
    </div>
  )
}

/* ── Note Type Dropdown ── */
function NoteTypeDropdown({ value, onChange, meta }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-1.5 text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full outline-none transition-opacity hover:opacity-80"
          style={{ background: meta.bg, color: meta.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
          {value}
          <ChevronDown size={10} strokeWidth={2.5} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="start"
          className="z-50 min-w-[160px] rounded-xl p-1 outline-none"
          style={{
            background: '#fff',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px -8px rgba(0,0,0,0.14), 0 2px 8px -2px rgba(0,0,0,0.06)',
          }}
        >
          {NOTE_TYPES.map((type) => {
            const m = TYPE_META[type]
            const active = type === value
            return (
              <DropdownMenu.Item
                key={type}
                onSelect={() => onChange(type)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-mono outline-none cursor-pointer transition-colors"
                style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.dot }} />
                <span className="flex-1 capitalize">{type}</span>
                {active && <Check size={12} style={{ color: 'var(--accent)' }} />}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

/* ── Delete Confirmation Dialog ── */
function DeleteDialog({ onConfirm, deleting }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          className="flex items-center gap-1.5 text-[11px] font-mono transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <Trash2 size={13} />
          Delete
        </button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
        />
        <AlertDialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[360px] rounded-2xl p-6 outline-none"
          style={{
            background: '#fff',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px -16px rgba(0,0,0,0.2)',
          }}
        >
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ background: '#FEF2F2' }}
          >
            <Trash2 size={18} style={{ color: '#ef4444' }} />
          </div>

          <AlertDialog.Title className="text-base font-semibold font-mono mb-1" style={{ color: 'var(--text-primary)' }}>
            Delete this note?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm font-mono mb-6" style={{ color: 'var(--text-secondary)' }}>
            This action is permanent and cannot be undone.
          </AlertDialog.Description>

          <div className="flex items-center gap-2 justify-end">
            <AlertDialog.Cancel
              className="px-4 py-2 rounded-lg text-sm font-mono font-medium outline-none cursor-pointer"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
            >
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={onConfirm}
              disabled={deleting}
              className="px-4 py-2 rounded-lg text-sm font-mono font-semibold text-white outline-none cursor-pointer disabled:opacity-50"
              style={{ background: '#ef4444' }}
            >
              {deleting ? 'Deleting…' : 'Delete note'}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
