'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

/* ── Icons ── */
const NotesIcon = (p) => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M13 2H5a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" />
    <path d="M8 6h3M8 9h3M8 12h1.5" />
  </svg>
)
const AskIcon = (p) => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h9a2 2 0 012 2z" />
  </svg>
)
const GraphIcon = (p) => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" {...p}>
    <circle cx="8" cy="8" r="2.5" />
    <circle cx="2.5" cy="5" r="1.5" />
    <circle cx="13.5" cy="5" r="1.5" />
    <circle cx="5" cy="13" r="1.5" />
    <path d="M4 6l2.5 1M11.5 6l-2.5 1M6.5 10.5l1-1.5" />
  </svg>
)
const InsightsIcon = (p) => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" {...p}>
    <path d="M13 13V8M8 13V3M3 13V9" />
  </svg>
)
const SettingsIcon = (p) => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="7.5" cy="7.5" r="2.25" />
    <path d="M12.8 9.75a1.25 1.25 0 00.25 1.37l.05.05a1.5 1.5 0 010 2.12 1.5 1.5 0 01-2.12 0l-.05-.05a1.25 1.25 0 00-1.37-.25 1.25 1.25 0 00-.76 1.15V14a1.5 1.5 0 01-3 0v-.07a1.25 1.25 0 00-.82-1.14 1.25 1.25 0 00-1.37.25l-.05.05a1.5 1.5 0 01-2.12-2.12l.05-.05a1.25 1.25 0 00.25-1.37A1.25 1.25 0 001.5 8.73H1a1.5 1.5 0 010-3h.07a1.25 1.25 0 001.14-.82 1.25 1.25 0 00-.25-1.37l-.05-.05a1.5 1.5 0 012.12-2.12l.05.05A1.25 1.25 0 005.45 1.7a1.25 1.25 0 001.14-.77V1a1.5 1.5 0 013 0v.07a1.25 1.25 0 001.15.76 1.25 1.25 0 001.37-.25l.05-.05a1.5 1.5 0 012.12 2.12l-.05.05a1.25 1.25 0 00-.25 1.37 1.25 1.25 0 001.15.76H14a1.5 1.5 0 010 3h-.07a1.25 1.25 0 00-1.13.92z" />
  </svg>
)

const mainNav = [
  { href: '/dashboard', label: 'Notes',    Icon: NotesIcon    },
  { href: '/ask',       label: 'Ask',      Icon: AskIcon      },
  { href: '/graph',     label: 'Graph',    Icon: GraphIcon    },
  { href: '/insights',  label: 'Insights', Icon: InsightsIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/note/')
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="shrink-0 flex flex-col h-full"
      style={{
        width: '200px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 shrink-0"
        style={{ height: '56px', borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          <span className="text-white text-[11px] font-display italic font-bold leading-none">J</span>
        </div>
        <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Jought
        </span>
      </div>

      {/* Main nav */}
      <div className="flex-1 p-2 pt-3 space-y-0.5">
        {mainNav.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background:  active ? 'var(--bg-active)'  : 'transparent',
                color:       active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight:  active ? 600 : 400,
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon style={{ color: active ? 'var(--accent)' : 'currentColor' }} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>

      {/* Bottom */}
      <div className="p-2 space-y-0.5" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            background: pathname === '/settings' ? 'var(--bg-active)' : 'transparent',
            color:      pathname === '/settings' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: pathname === '/settings' ? 600 : 400,
          }}
          onMouseEnter={(e) => { if (pathname !== '/settings') e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { if (pathname !== '/settings') e.currentTarget.style.background = 'transparent' }}
        >
          <SettingsIcon />
          <span>Settings</span>
        </Link>

        <div className="flex items-center gap-2.5 px-3 py-2">
          <UserButton afterSignOutUrl="/sign-in" />
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Account</span>
        </div>
      </div>
    </nav>
  )
}
