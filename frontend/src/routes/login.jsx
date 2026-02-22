import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { login } from '../lib/api'
import { useAuthStore } from '../stores/auth'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [form, setForm] = useState({ email: '', password: '' })

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      navigate({ to: '/' })
    },
  })

  const submit = (e) => {
    e.preventDefault()
    mutate(form)
  }

  return (
    <div className="flex items-center justify-center h-full">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border p-8 shadow-sm bg-white">
        <h1 className="text-2xl font-bold text-center">Sign in to Jought</h1>
        {error && <p className="text-red-500 text-sm">{error.message}</p>}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-600 py-2 text-white font-medium disabled:opacity-50"
        >
          {isPending ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
