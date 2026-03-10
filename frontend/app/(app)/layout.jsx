import NoteListPanel from '@/components/NoteListPanel'
import AskAIButton from '@/components/AskAIButton'
import ApiSetup from '@/components/ApiSetup'

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      <ApiSetup />
      <NoteListPanel />
      <div className="flex flex-1 min-w-0 overflow-hidden relative">
        {children}
        <AskAIButton />
      </div>
    </div>
  )
}
