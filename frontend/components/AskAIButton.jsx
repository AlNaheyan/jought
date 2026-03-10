'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { askNotes } from '@/lib/api'

export default function AskAIButton() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const { mutate: ask, isPending } = useMutation({
    mutationFn: askNotes,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer, sources: data.source_note_ids },
      ])
      if (data.conversation_id) setConversationId(data.conversation_id)
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const submit = (e) => {
    e.preventDefault()
    if (!question.trim() || isPending) return
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    ask({ question, conversation_id: conversationId || undefined })
    setQuestion('')
  }

  const clearChat = () => {
    setMessages([])
    setConversationId(null)
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
        style={{
          background: open ? 'var(--text-primary)' : 'var(--accent)',
          color: '#fff',
        }}
        title="Ask your notes"
      >
        {open ? (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        ) : (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 10.5a2 2 0 01-2 2H5.5l-3 3V4.5a2 2 0 012-2h8a2 2 0 012 2z" />
            <circle cx="5.5" cy="7" r="0.5" fill="currentColor" stroke="none" />
            <circle cx="8" cy="7" r="0.5" fill="currentColor" stroke="none" />
            <circle cx="10.5" cy="7" r="0.5" fill="currentColor" stroke="none" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-5 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: '380px',
            height: '480px',
            background: 'var(--bg-editor)',
            border: '1px solid var(--border)',
            boxShadow: '0 16px 48px -12px rgba(0,0,0,0.2)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 shrink-0"
            style={{ height: '48px', borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}
              >
                <span className="text-[9px] font-display italic font-bold" style={{ color: 'var(--accent)' }}>J</span>
              </div>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>Ask your notes</span>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-[10px] font-mono transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
            {messages.length === 0 && !isPending && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  Ask anything across your notes
                </p>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div
                    className="rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%] text-[12px] leading-relaxed"
                    style={{ background: 'var(--text-primary)', color: '#F9F7F1' }}
                  >
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-2 items-start">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'var(--accent-light)' }}
                  >
                    <span className="text-[8px] font-display italic font-bold" style={{ color: 'var(--accent)' }}>J</span>
                  </div>
                  <div
                    className="rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]"
                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {m.text}
                    </p>
                    {m.sources?.length > 0 && (
                      <p
                        className="text-[9px] font-mono mt-1.5 pt-1.5"
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
              <div className="flex gap-2 items-start">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-light)' }}
                >
                  <span className="text-[8px] font-display italic font-bold" style={{ color: 'var(--accent)' }}>J</span>
                </div>
                <div
                  className="rounded-xl rounded-tl-sm px-3 py-2"
                  style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
                >
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1 h-1 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: 'var(--text-tertiary)' }} />
                    <span className="w-1 h-1 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: 'var(--text-tertiary)' }} />
                    <span className="w-1 h-1 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: 'var(--text-tertiary)' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
            <form onSubmit={submit} className="flex gap-2">
              <input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something…"
                className="flex-1 rounded-lg px-3 py-2 text-[12px] outline-none"
                style={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                type="submit"
                disabled={isPending || !question.trim()}
                className="rounded-lg px-3 py-2 text-[11px] font-semibold transition-all disabled:opacity-40"
                style={{ background: 'var(--text-primary)', color: '#F9F7F1' }}
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
