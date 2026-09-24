import { useEffect, useState } from 'react'

export interface StoredUser {
  id: string
  email: string
  fullName: string
  role: 'FARMER' | 'DOCTOR' | 'ADMIN'
  status: string
}

export function useAuth() {
  const [user, setUser] = useState<StoredUser | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ani-care-user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        setUser(null)
      }
    }
  }, [])

  return { user }
}
