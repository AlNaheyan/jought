import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/insights')({
  component: Insights,
})

function Insights() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Insights</h1>
      <p className="text-gray-400 italic">Activity heatmap, sentiment trends, and weekly summary — Phase 2</p>
    </div>
  )
}
