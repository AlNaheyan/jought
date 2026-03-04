'use client'

import { useQuery } from '@tanstack/react-query'
import { getGraph } from '@/lib/api'

export default function KnowledgeGraph() {
  const { data, isLoading } = useQuery({
    queryKey: ['graph'],
    queryFn: getGraph,
  })

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-10">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Knowledge Graph</h1>
        <p className="font-mono text-xs text-zinc-400 mt-1">connections between your notes</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white h-96 flex items-center justify-center">
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin" />
        ) : (
          <div className="text-center">
            <p className="font-mono text-xs text-zinc-400">
              {data?.nodes?.length ?? 0} nodes · {data?.edges?.length ?? 0} edges
            </p>
            <p className="font-mono text-xs text-zinc-300 mt-1">D3 canvas — Phase 2</p>
          </div>
        )}
      </div>
    </div>
  )
}
