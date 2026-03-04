'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

const mainNav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/ask', label: 'Ask' },
  { href: '/graph', label: 'Graph' },
  { href: '/insights', label: 'Insights' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const linkClass = (href) =>
    `flex items-center px-3 py-2 rounded-md text-sm transition-colors duration-100 ${
      pathname === href
        ? 'bg-zinc-800 text-zinc-100 font-medium'
        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
    }`

  return (
    <nav className="w-56 shrink-0 bg-zinc-950 flex flex-col h-full border-r border-zinc-800/60">
      {/* Logo */}
      <div className="px-4 h-14 flex items-center gap-2.5 border-b border-zinc-800/60">
        <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center shrink-0">
          <span className="text-zinc-950 text-[9px] font-black leading-none">J</span>
        </div>
        <span className="text-zinc-100 font-semibold text-sm tracking-tight">Jought</span>
      </div>

      {/* Main nav */}
      <div className="flex-1 p-2 space-y-0.5 pt-3">
        {mainNav.map(({ href, label }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            {label}
          </Link>
        ))}
      </div>

      {/* Bottom nav + user */}
      <div className="p-2 border-t border-zinc-800/60 space-y-0.5">
        <Link href="/settings" className={linkClass('/settings')}>
          Settings
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <UserButton afterSignOutUrl="/sign-in" />
          <span className="text-zinc-500 text-xs">Account</span>
        </div>
      </div>
    </nav>
  )
}
