'use client'

import { useMutation } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { askNotes } from '@/lib/api'

export default function AskMyNotes() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const bottomRef = useRef(null)

  const { mutate: ask, isPending } = useMutation({
    mutationFn: askNotes,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer, sources: data.source_note_ids },
      ])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  const submit = (e) => {
    e.preventDefault()
    if (!question.trim() || isPending) return
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    ask({ question })
    setQuestion('')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-8 h-14 flex items-center border-b border-zinc-100">
        <div>
          <h1 className="text-sm font-semibold text-zinc-900">Ask</h1>
          <p className="font-mono text-[10px] text-zinc-400">query across all your notes</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-24">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
              <span className="text-zinc-400 text-lg">✦</span>
            </div>
            <p className="text-zinc-500 font-medium text-sm">Ask anything about your notes</p>
            <p className="text-zinc-400 text-xs mt-1 font-mono">powered by RAG</p>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="bg-zinc-900 text-zinc-100 rounded-2xl rounded-tr-md px-4 py-3 max-w-sm text-sm leading-relaxed">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[9px] font-black text-zinc-700">J</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl rounded-tl-md px-4 py-3 max-w-xl">
                <p className="text-sm text-zinc-700 font-mono leading-relaxed">{m.text}</p>
                {m.sources?.length > 0 && (
                  <p className="text-[10px] text-zinc-400 mt-2 font-mono pt-2 border-t border-zinc-200">
                    sources: {m.sources.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )
        )}

        {isPending && (
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-black text-zinc-700">J</span>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-8 py-4 border-t border-zinc-100 bg-white">
        <form onSubmit={submit} className="flex gap-2 items-end">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything across your notes…"
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 placeholder-zinc-400 transition-all font-mono"
          />
          <button
            type="submit"
            disabled={isPending || !question.trim()}
            className="bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm font-medium hover:bg-zinc-700 disabled:opacity-40 transition-colors shrink-0"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  )
}
