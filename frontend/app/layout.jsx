import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import { Instrument_Sans } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Providers from '@/components/Providers'
import Sidebar from '@/components/Sidebar'
import ApiSetup from '@/components/ApiSetup'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  title: 'Jought',
  description: 'Your AI-powered second brain',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${instrumentSans.variable} ${GeistMono.variable}`}>
        <body className="font-sans">
          <Providers>
            <ApiSetup />
            <SignedIn>
              <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </SignedIn>
            <SignedOut>{children}</SignedOut>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
