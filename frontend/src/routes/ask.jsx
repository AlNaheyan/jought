import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { askNotes } from '../lib/api'

export const Route = createFileRoute('/ask')({
  component: AskMyNotes,
})

function AskMyNotes() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])

  const { mutate: ask, isPending } = useMutation({
    mutationFn: askNotes,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer, sources: data.source_note_ids },
      ])
    },
  })

  const submit = (e) => {
    e.preventDefault()
    if (!question.trim()) return
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    ask({ question })
    setQuestion('')
  }

  return (
    <div className="flex flex-col h-full p-8 gap-4">
      <h1 className="text-2xl font-bold">Ask My Notes</h1>
      <div className="flex-1 overflow-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`rounded-lg p-3 max-w-2xl ${m.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100'}`}>
            <p>{m.text}</p>
            {m.sources?.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">Sources: {m.sources.join(', ')}</p>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything across your notes…"
          className="flex-1 rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white font-medium disabled:opacity-50"
        >
          {isPending ? '…' : 'Ask'}
        </button>
      </form>
    </div>
  )
}
