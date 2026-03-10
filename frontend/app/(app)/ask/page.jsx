'use client'

import { useMutation } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { askNotes } from '@/lib/api'

export default function AskMyNotes() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('ask_conversation_id') || null
    return null
  })
  const bottomRef = useRef(null)

  const { mutate: ask, isPending } = useMutation({
    mutationFn: askNotes,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer, sources: data.source_note_ids },
      ])
      if (data.conversation_id) {
        setConversationId(data.conversation_id)
        localStorage.setItem('ask_conversation_id', data.conversation_id)
      }
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  const submit = (e) => {
    e.preventDefault()
    if (!question.trim() || isPending) return
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    ask({ question, conversation_id: conversationId || undefined })
    setQuestion('')
  }

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: 'var(--bg-editor)' }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-8 shrink-0"
        style={{ height: '56px', borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Ask</h1>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            query across all your notes
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([])
              setConversationId(null)
              localStorage.removeItem('ask_conversation_id')
            }}
            className="flex items-center gap-1.5 text-[11px] font-mono transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6A4 4 0 1 1 6 2a4 4 0 0 1 2.83 1.17L7 5h3V2L8.83 3.17A5 5 0 1 0 11 6h-1z" fill="currentColor"/>
            </svg>
            New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-8 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-24">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--accent-light)' }}
            >
              <span className="font-display text-xl italic font-bold" style={{ color: 'var(--accent)' }}>J</span>
            </div>
            <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
              Ask anything about your notes
            </p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
              powered by RAG
            </p>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div
                className="rounded-2xl rounded-tr-md px-4 py-3 max-w-sm text-sm leading-relaxed"
                style={{ background: 'var(--text-primary)', color: '#F9F7F1' }}
              >
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3 items-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'var(--accent-light)' }}
              >
                <span className="text-[10px] font-display italic font-bold" style={{ color: 'var(--accent)' }}>J</span>
              </div>
              <div
                className="rounded-2xl rounded-tl-md px-4 py-3 max-w-xl"
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm font-reading leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {m.text}
                </p>
                {m.sources?.length > 0 && (
                  <p
                    className="text-[10px] font-mono mt-2 pt-2"
                    style={{ borderTop: '1px solid var(--border)', color: 'var(--text-tertiary)' }}
                  >
                    sources: {m.sources.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )
        )}

        {isPending && (
          <div className="flex gap-3 items-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--accent-light)' }}
            >
              <span className="text-[10px] font-display italic font-bold" style={{ color: 'var(--accent)' }}>J</span>
            </div>
            <div
              className="rounded-2xl rounded-tl-md px-4 py-3"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
            >
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]"   style={{ background: 'var(--text-tertiary)' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: 'var(--text-tertiary)' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: 'var(--text-tertiary)' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-8 py-4 shrink-0"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-editor)' }}
      >
        <form onSubmit={submit} className="flex gap-2 items-end">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything across your notes…"
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            type="submit"
            disabled={isPending || !question.trim()}
            className="rounded-xl px-5 py-3 text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'var(--text-primary)', color: '#F9F7F1' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  )
}
