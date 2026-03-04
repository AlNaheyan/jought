import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * Server-side: get the Clerk userId or redirect to /sign-in.
 * Use in server components and route handlers.
 */
export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return userId
}

/**
 * Server-side: get the full Clerk user object (name, email, avatar, etc).
 * Returns null if not signed in.
 */
export async function getClerkUser() {
  return await currentUser()
}

/**
 * Server-side: get userId without redirecting (returns null if not signed in).
 */
export async function getOptionalAuth() {
  const { userId } = await auth()
  return userId ?? null
}
