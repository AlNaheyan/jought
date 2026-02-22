import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../stores/auth'

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <Section title="Account">
        <button
          onClick={() => { logout(); navigate({ to: '/login' }) }}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </Section>

      <Section title="AI Model">
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
          <p className="font-medium text-gray-700 mb-1">Current model</p>
          <code className="text-blue-600">openai/gpt-oss-120b:free</code>
          <p className="mt-2 text-xs text-gray-400">Model switching coming in Phase 2</p>
        </div>
      </Section>

      <Section title="Export">
        <p className="text-sm text-gray-400 italic">Export to Markdown, JSON, PDF — Phase 3</p>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {children}
      </div>
    </div>
  )
}
