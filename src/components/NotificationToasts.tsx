import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

type NotificationItem = {
  id: string
  title: string
  message: string
}

export default function NotificationToasts() {
  const [toasts, setToasts] = useState<NotificationItem[]>([])
  const knownIds = useRef(new Set<string>())
  const initialized = useRef(false)
  const activeToken = useRef<string | null>(null)
  const timers = useRef(new Map<string, number>())

  useEffect(() => {
    let mounted = true
    const poll = async () => {
      const token = localStorage.getItem('ani-care-token')
      if (!token) {
        activeToken.current = null
        initialized.current = false
        knownIds.current.clear()
        setToasts([])
        return
      }
      if (activeToken.current !== token) {
        activeToken.current = token
        initialized.current = false
        knownIds.current.clear()
      }

      try {
        const response = await api.get('/notifications', {
          headers: { 'Cache-Control': 'no-cache' },
          params: { _poll: Date.now() },
        })
        if (!mounted || !Array.isArray(response.data)) return
        const items = response.data as NotificationItem[]
        if (!initialized.current) {
          items.forEach((item) => knownIds.current.add(item.id))
          initialized.current = true
          return
        }

        const freshItems = items.filter((item) => !knownIds.current.has(item.id))
        if (freshItems.length === 0) return
        freshItems.forEach((item) => knownIds.current.add(item.id))
        setToasts((current) => [...freshItems, ...current].slice(0, 4))
        freshItems.forEach((item) => {
          const timer = window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== item.id))
            timers.current.delete(item.id)
          }, 5000)
          timers.current.set(item.id, timer)
        })
      } catch {
        // A temporary network error is retried on the next poll.
      }
    }

    void poll()
    const interval = window.setInterval(() => void poll(), 4000)
    return () => {
      mounted = false
      window.clearInterval(interval)
      timers.current.forEach((timer) => window.clearTimeout(timer))
      timers.current.clear()
    }
  }, [])

  const dismiss = (id: string) => {
    const timer = timers.current.get(id)
    if (timer) window.clearTimeout(timer)
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <aside className="notification-toasts" aria-live="polite" aria-label="New notifications">
      {toasts.map((toast) => (
        <article className="notification-toast" key={toast.id}>
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">×</button>
        </article>
      ))}
    </aside>
  )
}
