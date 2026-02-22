import {
  createRootRouteWithContext,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAuthStore } from '../stores/auth'

export const Route = createRootRouteWithContext()({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem('access_token')
    if (!token && location.pathname !== '/login') {
      throw redirect({ to: '/login' })
    }
  },
  component: RootLayout,
})

function RootLayout() {
  const token = localStorage.getItem('access_token')
  if (!token) return <Outlet />

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  )
}

function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <nav className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="p-5 border-b border-gray-100">
        <span className="text-xl font-bold tracking-tight text-blue-600">Jought</span>
      </div>
      <div className="flex-1 flex flex-col gap-1 p-3">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/ask">Ask My Notes</NavLink>
        <NavLink to="/graph">Knowledge Graph</NavLink>
        <NavLink to="/insights">Insights</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </div>
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full rounded-md px-3 py-2 text-sm text-left text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      activeProps={{ className: 'rounded-md px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700' }}
    >
      {children}
    </Link>
  )
}
