import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRouteWithContext()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="w-56 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col gap-1 p-4">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/graph">Knowledge Graph</NavLink>
        <NavLink to="/ask">Ask My Notes</NavLink>
        <NavLink to="/insights">Insights</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      activeProps={{ className: 'bg-gray-100 dark:bg-gray-800 font-semibold' }}
    >
      {children}
    </Link>
  )
}
