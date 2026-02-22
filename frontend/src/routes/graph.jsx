import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getGraph } from '../lib/api'

export const Route = createFileRoute('/graph')({
  component: KnowledgeGraph,
})

function KnowledgeGraph() {
  const { data, isLoading } = useQuery({
    queryKey: ['graph'],
    queryFn: getGraph,
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Knowledge Graph</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading graph…</p>
      ) : (
        <p className="text-gray-400 italic">
          {data?.nodes.length ?? 0} nodes · {data?.edges.length ?? 0} edges — D3 canvas in Phase 2
        </p>
      )}
    </div>
  )
}
