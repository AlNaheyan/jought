import Sidebar from '@/components/Sidebar'
import ApiSetup from '@/components/ApiSetup'

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden">
      <ApiSetup />
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
