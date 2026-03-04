import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen font-ui overflow-x-hidden" style={{ background: '#F9F7F1' }}>

      {/* Grain texture overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }}
      />

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-8 h-14"
        style={{ background: 'rgba(249,247,241,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(221,219,214,0.7)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: '#C08030' }}>
            <span className="text-white text-[11px] font-display italic font-bold leading-none">J</span>
          </div>
          <span className="font-semibold text-paper-900 text-sm tracking-tight">Jought</span>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/sign-in" className="text-sm text-paper-600 hover:text-paper-900 transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold text-white px-4 py-1.5 rounded-lg transition-all hover:opacity-90"
            style={{ background: '#1C1B18' }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-16 px-8 text-center">

        {/* Eyebrow chip */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-10 opacity-0 animate-fade-up delay-100"
          style={{ background: '#F0EDE4', border: '1px solid #DDD8CC', animationFillMode: 'forwards' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C08030' }} />
          <span className="text-[10px] font-mono text-paper-600 tracking-[0.18em] uppercase">
            AI Smart Notebook · Beta
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display leading-[0.88] tracking-tight mb-7 mx-auto opacity-0 animate-fade-up delay-200"
          style={{
            fontSize: 'clamp(3.5rem, 10vw, 7.5rem)',
            maxWidth: '800px',
            animationFillMode: 'forwards',
          }}
        >
          <span className="block font-normal italic" style={{ color: '#7A7570' }}>Write freely,</span>
          <span className="block font-bold" style={{ color: '#1C1B18' }}>think deeply.</span>
        </h1>

        <p
          className="text-paper-600 max-w-sm mx-auto text-[15px] leading-relaxed mb-10 opacity-0 animate-fade-up delay-300"
          style={{ animationFillMode: 'forwards' }}
        >
          Jought auto-organizes your notes, surfaces hidden connections, and lets you chat with your entire knowledge base.
        </p>

        {/* CTAs */}
        <div
          className="flex items-center justify-center gap-3 mb-20 opacity-0 animate-fade-up delay-400"
          style={{ animationFillMode: 'forwards' }}
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl transition-all hover:opacity-90"
            style={{ background: '#1C1B18' }}
          >
            Start writing free
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 7h10M8 3l4 4-4 4" />
            </svg>
          </Link>
          <Link href="/sign-in" className="text-sm text-paper-500 hover:text-paper-900 transition-colors px-3 py-3">
            Sign in →
          </Link>
        </div>

        {/* ── App Mockup ── */}
        <div
          className="relative max-w-[860px] mx-auto opacity-0 animate-fade-up delay-500"
          style={{ animationFillMode: 'forwards' }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-x-16 bottom-0 top-8 rounded-3xl blur-3xl"
            style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(192,128,48,0.12) 0%, transparent 70%)', zIndex: 0 }}
          />

          {/* Browser chrome */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              border: '1px solid #D8D4CB',
              boxShadow: '0 32px 80px -16px rgba(28,27,24,0.18), 0 8px 24px -8px rgba(28,27,24,0.08)',
              zIndex: 1,
            }}
          >
            {/* Title bar */}
            <div className="flex items-center gap-1.5 px-4 h-9 border-b" style={{ background: '#EDECEA', borderColor: '#DDDBD6' }}>
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF6058]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBB2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2CC840]" />
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded px-3 h-4 flex items-center" style={{ border: '1px solid #DDDBD6' }}>
                  <span className="font-mono text-[8px] text-paper-400">jought.app/note/morning-journal</span>
                </div>
              </div>
            </div>

            {/* Three-panel UI */}
            <div className="flex" style={{ height: '400px' }}>

              {/* Nav Sidebar */}
              <div className="shrink-0 flex flex-col border-r" style={{ width: '168px', background: '#EDECEA', borderColor: '#DDDBD6' }}>
                <div className="flex items-center gap-2 px-3 border-b shrink-0" style={{ height: '42px', borderColor: '#DDDBD6' }}>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: '#C08030' }}>
                    <span className="text-white text-[9px] font-display italic font-bold leading-none">J</span>
                  </div>
                  <span className="text-[11px] font-semibold text-paper-900">Jought</span>
                </div>
                <div className="flex-1 p-2 pt-2.5 space-y-0.5">
                  {[
                    { label: 'Notes',    active: true  },
                    { label: 'Ask',      active: false },
                    { label: 'Graph',    active: false },
                    { label: 'Insights', active: false },
                  ].map(({ label, active }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                      style={{ background: active ? '#E0DEDB' : 'transparent' }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-sm shrink-0"
                        style={{ background: active ? '#C08030' : '#AEADA9' }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ color: active ? '#1C1B18' : '#706F6B', fontWeight: active ? 600 : 400 }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                {/* User pill at bottom */}
                <div className="p-2 border-t" style={{ borderColor: '#DDDBD6' }}>
                  <div className="flex items-center gap-2 px-2.5 py-2">
                    <div className="w-5 h-5 rounded-full bg-paper-300 shrink-0" />
                    <div className="h-1.5 rounded-full bg-paper-300 w-14" />
                  </div>
                </div>
              </div>

              {/* Note List Panel */}
              <div className="shrink-0 flex flex-col border-r" style={{ width: '212px', background: '#F0EFEC', borderColor: '#DDDBD6' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-3 border-b shrink-0" style={{ height: '42px', borderColor: '#DDDBD6' }}>
                  <span className="text-[11px] font-semibold text-paper-900">Notes</span>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#E0DEDB' }}>
                    <span className="text-[11px] text-paper-600 leading-none">+</span>
                  </div>
                </div>
                {/* Search */}
                <div className="px-2.5 py-2 border-b shrink-0" style={{ borderColor: '#DDDBD6' }}>
                  <div className="h-5 rounded-md flex items-center px-2" style={{ background: '#E8E6E2' }}>
                    <span className="text-[8px] text-paper-400">Search notes…</span>
                  </div>
                </div>
                {/* Note items */}
                <div className="flex-1 overflow-hidden px-1.5 py-1 space-y-0.5">
                  {[
                    { title: 'Q4 Planning Meeting',     dot: '#a78bfa', active: false },
                    { title: 'Research: RAG systems',   dot: '#60a5fa', active: false },
                    { title: 'Morning journal entry',   dot: '#34d399', active: true  },
                    { title: 'Ideas: product roadmap',  dot: '#fbbf24', active: false },
                    { title: 'Weekly retrospective',    dot: '#AEADA9', active: false },
                  ].map(({ title, dot, active }) => (
                    <div
                      key={title}
                      className="flex items-start gap-2 px-2.5 py-2 rounded-lg"
                      style={{ background: active ? '#E0DEDB' : 'transparent' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-[3px]" style={{ background: dot }} />
                      <div className="min-w-0">
                        <p
                          className="text-[9px] truncate"
                          style={{ color: active ? '#1C1B18' : '#706F6B', fontWeight: active ? 600 : 400 }}
                        >
                          {title}
                        </p>
                        <p className="text-[8px] font-mono mt-0.5" style={{ color: '#AEADA9' }}>Mar 3</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor Panel */}
              <div className="flex-1 flex flex-col bg-white">
                {/* Editor top bar */}
                <div className="flex items-center justify-between px-6 border-b shrink-0" style={{ height: '42px', borderColor: '#F0EFEC' }}>
                  <div
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                    style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}
                  >
                    <span className="text-[8px] font-semibold" style={{ color: '#059669' }}>journal</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[8px] font-mono" style={{ color: '#10b981' }}>Saved</span>
                    <span className="text-[8px] font-mono" style={{ color: '#AEADA9' }}>Delete</span>
                  </div>
                </div>

                {/* Editor content */}
                <div className="flex-1 px-8 py-6 overflow-hidden">
                  <p className="font-display font-bold mb-4 leading-tight" style={{ fontSize: '18px', color: '#1C1B18' }}>
                    Morning journal entry
                  </p>

                  {/* Toolbar line */}
                  <div className="flex items-center gap-1 mb-4 pb-3" style={{ borderBottom: '1px solid #F0EFEC' }}>
                    {['B', 'I', 'H1', 'H2', '•', '1.'].map((t) => (
                      <div key={t} className="h-5 px-1.5 rounded flex items-center" style={{ background: '#F0EFEC' }}>
                        <span className="text-[8px] font-mono" style={{ color: '#706F6B' }}>{t}</span>
                      </div>
                    ))}
                  </div>

                  {/* Body text simulation */}
                  <div className="space-y-2">
                    <div className="h-2 rounded-full w-full" style={{ background: '#F0EFEC' }} />
                    <div className="h-2 rounded-full w-5/6" style={{ background: '#F0EFEC' }} />
                    <div className="h-2 rounded-full w-4/5" style={{ background: '#F0EFEC' }} />
                    <div className="h-2 rounded-full w-0 mb-2" />
                    <div className="h-2 rounded-full w-full" style={{ background: '#F0EFEC' }} />
                    <div className="h-2 rounded-full w-3/4" style={{ background: '#F0EFEC' }} />
                    <div className="h-2 rounded-full w-5/6" style={{ background: '#F0EFEC' }} />
                    <div className="h-2 rounded-full w-2/3" style={{ background: '#F0EFEC' }} />
                  </div>

                  {/* AI tags */}
                  <div className="flex items-center gap-1.5 mt-5">
                    <span className="text-[7px] font-mono" style={{ color: '#AEADA9' }}>✦ AI tagged:</span>
                    {['#reflection', '#morning-routine', '#growth'].map((tag) => (
                      <div
                        key={tag}
                        className="px-1.5 py-0.5 rounded-full"
                        style={{ background: '#FEF3E2', border: '1px solid #F5D9A8' }}
                      >
                        <span className="text-[7px] font-mono" style={{ color: '#C08030' }}>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white px-8 py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-[10px] text-paper-400 uppercase tracking-[0.2em] mb-3">
              What Jought does
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-paper-900 tracking-tight">
              Your notes.<br />
              <span className="italic font-normal" style={{ color: '#C08030' }}>Connected.</span>
            </h2>
          </div>

          {/* Asymmetric editorial grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large feature — left */}
            <div
              className="md:col-span-2 rounded-2xl p-8 flex flex-col justify-between"
              style={{ background: '#F9F7F1', border: '1px solid #E8E5DE', minHeight: '240px' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 font-display text-lg italic font-bold"
                style={{ background: '#FEF3E2', color: '#C08030' }}
              >
                ✦
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-paper-900 mb-2">Auto-tagging</h3>
                <p className="text-paper-600 text-sm leading-relaxed max-w-sm">
                  The moment you save, Jought reads your note and applies semantic tags automatically. No folders. No manual labels. Just write.
                </p>
              </div>
            </div>

            {/* Small feature — right */}
            <div
              className="rounded-2xl p-7 flex flex-col justify-between"
              style={{ background: '#F0F4FF', border: '1px solid #DBEAFE', minHeight: '240px' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: '#DBEAFE' }}
              >
                <span className="text-blue-500 text-lg">◎</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-paper-900 mb-2">Ask your notes</h3>
                <p className="text-paper-600 text-sm leading-relaxed">
                  Chat with your entire knowledge base. Get cited answers powered by RAG.
                </p>
              </div>
            </div>

            {/* Small feature — left */}
            <div
              className="rounded-2xl p-7 flex flex-col justify-between"
              style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', minHeight: '220px' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: '#DCFCE7' }}
              >
                <span className="text-emerald-500 text-lg">◈</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-paper-900 mb-2">Knowledge graph</h3>
                <p className="text-paper-600 text-sm leading-relaxed">
                  Visualize how your ideas connect. Discover patterns you never noticed.
                </p>
              </div>
            </div>

            {/* Large feature — right */}
            <div
              className="md:col-span-2 rounded-2xl p-8 flex flex-col justify-between"
              style={{ background: '#1C1B18', border: '1px solid #2A2926', minHeight: '220px' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: '#2A2926' }}
              >
                <span className="text-paper-400 text-lg">◐</span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">AI writing tools</h3>
                <p className="text-paper-500 text-sm leading-relaxed max-w-sm">
                  Stuck? Highlight any text and ask Jought to summarize, expand, or rewrite it — right inside the editor. Your thoughts, sharpened.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-8 py-24" style={{ background: '#F9F7F1' }}>
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-[10px] text-paper-400 uppercase tracking-[0.2em] mb-12 text-center">
            How it works
          </p>
          <div className="space-y-12">
            {[
              {
                n: '01',
                title: 'Write like normal',
                desc: 'Use the Tiptap rich text editor exactly like any note app. Markdown shortcuts, code blocks, lists — everything you expect.',
              },
              {
                n: '02',
                title: 'AI handles the rest',
                desc: 'On every save, Jought auto-tags your note, embeds it into your personal knowledge graph, and links it to related ideas.',
              },
              {
                n: '03',
                title: 'Query your knowledge',
                desc: 'Ask questions across every note you\'ve ever written. Jought retrieves the most relevant context and gives you a cited answer.',
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-8">
                <span className="font-mono text-[11px] text-paper-400 tracking-widest shrink-0 mt-1">{n}</span>
                <div style={{ borderLeft: '1px solid #DDDBD6', paddingLeft: '2rem' }}>
                  <h3 className="font-display text-xl font-bold text-paper-900 mb-2">{title}</h3>
                  <p className="text-paper-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-8 py-28 text-center" style={{ background: '#1C1B18' }}>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-8" style={{ color: '#4A4946' }}>
          Join the beta · Free
        </p>
        <h2 className="font-display leading-[0.9] tracking-tight mb-5 mx-auto" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', maxWidth: '600px' }}>
          <span className="block font-normal italic" style={{ color: '#706F6B' }}>Start building your</span>
          <span className="block font-bold text-white">second brain.</span>
        </h2>
        <p className="text-sm mb-10" style={{ color: '#4A4946' }}>
          No credit card required · Works with any writing style
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 font-semibold text-sm px-8 py-4 rounded-xl transition-all hover:opacity-90"
          style={{ background: '#C08030', color: '#fff' }}
        >
          Create your account free
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7h10M8 3l4 4-4 4" />
          </svg>
        </Link>
      </section>

      {/* ── Footer ── */}
      <div className="px-8 py-5 flex items-center justify-between" style={{ background: '#1C1B18', borderTop: '1px solid #2A2926' }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#C08030' }}>
            <span className="text-white text-[9px] font-display italic font-bold leading-none">J</span>
          </div>
          <span className="font-mono text-xs" style={{ color: '#4A4946' }}>Jought</span>
        </div>
        <span className="font-mono text-xs" style={{ color: '#2A2926' }}>© 2025</span>
      </div>
    </div>
  )
}
