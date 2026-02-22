import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getNotes } from '../lib/api'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading notes…</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border p-4 bg-white shadow-sm">
              <span className="font-medium">{note.title}</span>
              <span className="ml-2 text-xs text-gray-400">{note.note_type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
