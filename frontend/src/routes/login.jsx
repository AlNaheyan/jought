import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { login, register } from '../lib/api'
import { useAuthStore } from '../stores/auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [tab, setTab] = useState('login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Jought</h1>
          <p className="text-gray-500 mt-1 text-sm">Your AI-powered second brain</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            <TabBtn active={tab === 'login'} onClick={() => setTab('login')}>Sign In</TabBtn>
            <TabBtn active={tab === 'register'} onClick={() => setTab('register')}>Register</TabBtn>
          </div>
          <div className="p-6">
            {tab === 'login' ? <LoginForm /> : <RegisterForm onSuccess={() => setTab('login')} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginForm() {
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

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate(form) }} className="space-y-4">
      {error && <p className="text-sm text-red-500 bg-red-50 rounded-md p-2">{error.message}</p>}
      <Input type="email" placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input type="password" placeholder="Password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <SubmitBtn loading={isPending}>Sign In</SubmitBtn>
    </form>
  )
}

function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const { mutate, isPending, error } = useMutation({
    mutationFn: register,
    onSuccess: () => onSuccess(),
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate(form) }} className="space-y-4">
      {error && <p className="text-sm text-red-500 bg-red-50 rounded-md p-2">{error.message}</p>}
      <Input placeholder="Full name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input type="email" placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input type="password" placeholder="Password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <SubmitBtn loading={isPending}>Create Account</SubmitBtn>
    </form>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition-colors ${
        active ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

function Input(props) {
  return (
    <input
      {...props}
      required
      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
    />
  )
}

function SubmitBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-blue-600 py-2.5 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}
