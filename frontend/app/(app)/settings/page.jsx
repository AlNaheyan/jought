export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <div className="mb-10">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Settings</h1>
        <p className="font-mono text-xs text-zinc-400 mt-1">manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        <Section title="Account">
          <p className="text-sm text-zinc-500">
            Manage your profile, email, and connected accounts via the profile button in the sidebar.
          </p>
        </Section>

        <Section title="AI Model">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-700">Active model</p>
              <p className="font-mono text-xs text-zinc-400 mt-0.5">model switching coming in Phase 2</p>
            </div>
            <code className="font-mono text-xs text-zinc-900 bg-zinc-100 px-2.5 py-1.5 rounded-md">
              gpt-oss-120b:free
            </code>
          </div>
        </Section>

        <Section title="Export">
          <p className="text-sm text-zinc-400 font-mono">
            Export to Markdown, JSON, PDF — Phase 3
          </p>
        </Section>

        <Section title="Privacy">
          <p className="text-sm text-zinc-400 font-mono">
            Private note controls and data deletion — Phase 2
          </p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-zinc-100">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}
