import { ClerkProvider } from '@clerk/nextjs'
import { Instrument_Sans } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Providers from '@/components/Providers'

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
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
