export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 select-none">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'var(--accent-light)' }}
      >
        <span
          className="text-3xl font-display italic font-bold leading-none"
          style={{ color: 'var(--accent)' }}
        >
          J
        </span>
      </div>
      <h2 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Select a note to begin
      </h2>
      <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Choose a note from the list, or create a new one to start writing.
      </p>
    </div>
  )
}
