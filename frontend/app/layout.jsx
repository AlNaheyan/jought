import { ClerkProvider } from '@clerk/nextjs'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Jought',
  description: 'Your AI-powered second brain',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={GeistMono.variable}>
        <body className="font-mono">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
