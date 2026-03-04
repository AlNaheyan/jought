'use client'

import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getNote, updateNote, deleteNote, summarizeNote, expandText, rewriteText } from '@/lib/api'
import Editor from '@/components/Editor'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Check, ChevronDown, Trash2, Clock, FileText, Sparkles, X, Copy } from 'lucide-react'

/* ── Types ── */
const NOTE_TYPES = ['general', 'meeting', 'journal', 'todo', 'research']
const TONES = ['formal', 'casual', 'concise', 'creative']

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
  const [plainText,  setPlainText]  = useState('')
  const [noteType,   setNoteType]   = useState('general')
  const [saveStatus, setSaveStatus] = useState('saved')
  const [words,      setWords]      = useState(0)
  const [aiPanel,    setAiPanel]    = useState(false)
  const [aiResult,   setAiResult]   = useState(null)   // { label, text }
  const [aiLoading,  setAiLoading]  = useState(false)
  const [aiError,    setAiError]    = useState(null)
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
    setPlainText(text)
    setWords(wordCount(text))
    scheduleSave({ title, content: json, content_plain: text, note_type: noteType })
  }

  const handleTypeChange = (type) => {
    setNoteType(type)
    scheduleSave({ title, content, note_type: type })
  }

  /* ── AI actions ── */
  const runAI = async (action, opts = {}) => {
    if (!plainText.trim()) return
    setAiResult(null)
    setAiError(null)
    setAiLoading(true)
    setAiPanel(true)
    try {
      let result
      if (action === 'summarize') {
        result = await summarizeNote({ note_id: id })
        setAiResult({ label: 'Summary', text: result.summary })
      } else if (action === 'expand') {
        result = await expandText({ text: plainText })
        setAiResult({ label: 'Expanded', text: result.expanded })
      } else if (action === 'rewrite') {
        result = await rewriteText({ text: plainText, tone: opts.tone })
        setAiResult({ label: `Rewritten (${opts.tone})`, text: result.rewritten })
      }
    } catch {
      setAiError('Something went wrong. Try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const copyResult = () => {
    if (aiResult?.text) navigator.clipboard.writeText(aiResult.text)
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-4 h-4 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  const meta       = TYPE_META[noteType] ?? TYPE_META.general
  const save_state = SAVE_STATE[saveStatus] ?? SAVE_STATE.saved
  const updatedAt  = note?.updated_at
    ? new Date(note.updated_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="flex h-full bg-white">

      {/* ── Main editor column ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 bg-white/92"
          style={{ height: '48px', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}
        >
          <NoteTypeDropdown value={noteType} onChange={handleTypeChange} meta={meta} />

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono tabular-nums" style={{ color: save_state.color }}>
              {save_state.label}
            </span>

            <DeleteDialog onConfirm={() => remove()} deleting={deleting} />
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[700px] mx-auto px-10 pt-10 pb-24">
            <input
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled"
              className="w-full bg-transparent outline-none font-mono font-bold leading-tight mb-2"
              style={{ fontSize: '1.875rem', color: 'var(--text-primary)', caretColor: 'var(--accent)' }}
            />

            <div className="flex items-center gap-4 mb-8">
              {updatedAt && (
                <span className="flex items-center gap-1 text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  <Clock size={10} />{updatedAt}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                <FileText size={10} />{words} {words === 1 ? 'word' : 'words'}
              </span>
            </div>

            <Editor
              content={content}
              onChange={handleContentChange}
              aiActions={{
                onSummarize: () => runAI('summarize'),
                onExpand:    () => runAI('expand'),
                onRewrite:   (tone) => runAI('rewrite', { tone }),
              }}
            />
          </div>
        </div>
      </div>

      {/* ── AI Panel (slide in) ── */}
      {aiPanel && (
        <div
          className="flex flex-col shrink-0 h-full overflow-hidden"
          style={{
            width: '320px',
            borderLeft: '1px solid var(--border)',
            background: 'var(--bg-panel)',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 shrink-0"
            style={{ height: '48px', borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={13} style={{ color: 'var(--accent)' }} />
              <span className="text-[11px] font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                AI Assistant
              </span>
            </div>
            <button
              onClick={() => setAiPanel(false)}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X size={13} />
            </button>
          </div>

          {/* Quick actions */}
          <div className="px-4 py-3 flex flex-wrap gap-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <AIChip onClick={() => runAI('summarize')} loading={aiLoading}>Summarize</AIChip>
            <AIChip onClick={() => runAI('expand')} loading={aiLoading}>Expand</AIChip>
            {TONES.map((tone) => (
              <AIChip key={tone} onClick={() => runAI('rewrite', { tone })} loading={aiLoading}>
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </AIChip>
            ))}
          </div>

          {/* Result area */}
          <div className="flex-1 overflow-auto px-4 py-4">
            {aiLoading && (
              <div className="flex flex-col items-center justify-center h-32 gap-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'var(--accent)', animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>thinking…</span>
              </div>
            )}

            {aiError && !aiLoading && (
              <p className="text-[11px] font-mono" style={{ color: '#ef4444' }}>{aiError}</p>
            )}

            {aiResult && !aiLoading && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                    {aiResult.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={copyResult}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}
                    >
                      <Copy size={10} /> copy
                    </button>
                  </div>
                </div>
                <p
                  className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {aiResult.text}
                </p>
              </div>
            )}

            {!aiLoading && !aiResult && !aiError && (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Sparkles size={20} style={{ color: 'var(--text-placeholder)', marginBottom: 8 }} />
                <p className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  Pick an action above
                </p>
              </div>
            )}
          </div>
        </div>
      )}
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
          style={{ background: '#fff', border: '1px solid var(--border)', boxShadow: '0 24px 64px -16px rgba(0,0,0,0.2)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: '#FEF2F2' }}>
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
