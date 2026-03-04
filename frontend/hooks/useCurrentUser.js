'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'

/**
 * Returns the current user's DB record (auto-provisioned on first call).
 * Safe to call anywhere — only fetches when signed in.
 */
export function useCurrentUser() {
  const { isSignedIn } = useAuth()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.get('/api/auth/me').then((r) => r.data),
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000,
  })
}
