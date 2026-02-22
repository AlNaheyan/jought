import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNote, updateNote } from '../lib/api'

export const Route = createFileRoute('/note/$id')({
  component: NoteEditor,
})

function NoteEditor() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => getNote(id),
  })

  const { mutate: save } = useMutation({
    mutationFn: (data) => updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['note', id] })
    },
  })

  if (isLoading) return <div className="p-8 text-gray-500">Loading…</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{note?.title ?? 'Untitled'}</h1>
      {/* Tiptap editor wired here in Phase 1 */}
      <p className="text-gray-400 italic">Editor coming in Phase 1…</p>
    </div>
  )
}
