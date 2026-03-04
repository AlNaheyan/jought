export default function Insights() {
  const placeholders = [
    { label: 'Activity heatmap', desc: 'writing streaks and daily patterns' },
    { label: 'Sentiment trends', desc: 'emotional arc across your notes' },
    { label: 'Weekly summary', desc: 'AI-generated digest of your week' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-10">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Insights</h1>
        <p className="font-mono text-xs text-zinc-400 mt-1">patterns and trends in your knowledge base</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {placeholders.map(({ label, desc }) => (
          <div key={label} className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-700">{label}</p>
            <p className="font-mono text-xs text-zinc-400 mt-1">{desc}</p>
            <p className="font-mono text-[10px] text-zinc-300 mt-4">Phase 2</p>
          </div>
        ))}
      </div>
    </div>
  )
}
