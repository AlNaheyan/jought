import Sidebar from '@/components/Sidebar'
import ApiSetup from '@/components/ApiSetup'

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      <ApiSetup />
      <Sidebar />
      {/* Content area: flex-1 so it fills the space after the sidebar */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
