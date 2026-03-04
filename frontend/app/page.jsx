import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-zinc-800/60 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center shrink-0">
            <span className="text-zinc-950 text-[9px] font-black leading-none">J</span>
          </div>
          <span className="text-zinc-100 font-semibold text-sm tracking-tight">Jought</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="flex items-center gap-1.5 bg-white text-zinc-950 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-8 pt-28 pb-20">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/50 rounded-full px-4 py-1.5 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="font-mono text-[11px] text-zinc-400 tracking-wide">
            RAG · Knowledge Graphs · AI Writing
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-white max-w-4xl leading-[0.92] mb-7">
          Your second brain,{' '}
          <span className="text-zinc-500">powered by AI.</span>
        </h1>

        <p className="font-mono text-sm text-zinc-400 max-w-lg leading-relaxed mb-10">
          Write freely. Jought auto-organizes, surfaces connections, and answers
          questions across your entire knowledge base.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3 mb-20">
          <Link
            href="/sign-up"
            className="flex items-center gap-2 bg-white text-zinc-950 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            Get started free <span>→</span>
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors px-4 py-3"
          >
            Sign in
          </Link>
        </div>

        {/* App preview */}
        <div className="w-full max-w-3xl mx-auto rounded-xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/60">
          {/* Window chrome */}
          <div className="bg-zinc-900 h-9 flex items-center gap-1.5 px-4 border-b border-zinc-800">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="ml-4 font-mono text-[10px] text-zinc-600">jought.app/dashboard</div>
          </div>
          {/* App chrome */}
          <div className="flex h-56">
            {/* Sidebar */}
            <div className="w-40 bg-zinc-950 border-r border-zinc-800 flex flex-col p-3 gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-3.5 h-3.5 rounded bg-white shrink-0" />
                <div className="h-2 rounded-full bg-zinc-700 w-12" />
              </div>
              {[28, 16, 20, 14, 18].map((w, i) => (
                <div
                  key={i}
                  className={`h-5 rounded-md flex items-center px-2 gap-1.5 ${i === 0 ? 'bg-zinc-800' : ''}`}
                >
                  <div className={`h-1.5 rounded-full ${i === 0 ? 'bg-zinc-500' : 'bg-zinc-700'}`} style={{ width: `${w * 2}px` }} />
                </div>
              ))}
            </div>
            {/* Content */}
            <div className="flex-1 bg-zinc-50 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="h-3 rounded-full bg-zinc-200 w-16" />
                <div className="h-6 rounded-lg bg-zinc-800 w-20" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['bg-violet-100', 'bg-violet-200'],
                  ['bg-emerald-100', 'bg-emerald-200'],
                  ['bg-amber-100', 'bg-amber-200'],
                ].map(([bg, dot], i) => (
                  <div key={i} className="rounded-lg border border-zinc-200 bg-white p-3">
                    <div className="h-2 rounded-full bg-zinc-100 w-full mb-1.5" />
                    <div className="h-2 rounded-full bg-zinc-100 w-3/4 mb-3" />
                    <div className={`h-1.5 rounded-full w-10 ${dot}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-[11px] text-zinc-400 text-center uppercase tracking-widest mb-12">
            What Jought does
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-zinc-950 border-t border-zinc-800/60 px-8 py-24 flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold text-white tracking-tighter mb-3">
          Start writing for free
        </h2>
        <p className="font-mono text-xs text-zinc-500 mb-8">No credit card required</p>
        <Link
          href="/sign-up"
          className="bg-white text-zinc-950 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors"
        >
          Create your second brain →
        </Link>
      </section>

      {/* Footer */}
      <div className="bg-zinc-950 border-t border-zinc-800/60 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white flex items-center justify-center">
            <span className="text-zinc-950 text-[7px] font-black leading-none">J</span>
          </div>
          <span className="text-zinc-600 font-mono text-xs">Jought</span>
        </div>
        <span className="text-zinc-700 font-mono text-xs">© 2025</span>
      </div>
    </div>
  )
}

const features = [
  {
    icon: '✦',
    title: 'Auto-tagging',
    desc: 'AI tags your notes instantly as you write — no manual work.',
  },
  {
    icon: '◎',
    title: 'Ask your notes',
    desc: 'Chat with your entire knowledge base using RAG-powered search.',
  },
  {
    icon: '◈',
    title: 'Knowledge graph',
    desc: 'See connections between your ideas visualized automatically.',
  },
  {
    icon: '◐',
    title: 'AI writing tools',
    desc: 'Summarize, expand, rewrite — built right into the editor.',
  },
]

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4 text-sm text-zinc-500">
        {icon}
      </div>
      <h3 className="font-semibold text-zinc-900 text-sm mb-1.5">{title}</h3>
      <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  )
}
