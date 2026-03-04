import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-sm font-black">J</span>
        </div>
        <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">Jought</h1>
        <p className="font-mono text-xs text-zinc-400 mt-1">your AI-powered second brain</p>
      </div>
      <SignUp />
    </div>
  )
}
