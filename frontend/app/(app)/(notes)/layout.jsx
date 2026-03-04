import NoteListPanel from '@/components/NoteListPanel'

export default function NotesLayout({ children }) {
  return (
    <>
      <NoteListPanel />
      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </>
  )
}
