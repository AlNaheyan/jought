import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-400 italic">Account, AI model, export, and privacy controls — Phase 1</p>
    </div>
  )
}
