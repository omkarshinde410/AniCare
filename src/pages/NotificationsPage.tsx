import { useEffect, useState } from 'react'
import { api } from '../api'

type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const role = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}').role ?? 'FARMER'

  const loadNotifications = () => api.get('/notifications')
    .then((response) => setNotifications(response.data))
    .catch(() => setError('Unable to load notifications.'))
    .finally(() => setLoading(false))

  useEffect(() => {
    void loadNotifications()
  }, [])

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: true } : notification))
    } catch {
      setError('Unable to update this notification.')
    }
  }

  const visibleNotifications = notifications.filter((notification) => {
    const matchesFilter = filter === 'ALL' || !notification.read
    const searchText = `${notification.title} ${notification.message}`.toLowerCase()
    return matchesFilter && searchText.includes(search.trim().toLowerCase())
  })
  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <main className="page shell">
      <section className="notifications-heading">
        <div><p className="section-kicker">{role === 'DOCTOR' ? 'PRACTICE UPDATES' : 'FARMER UPDATES'}</p><h1>Inbox</h1><p>Appointment and care updates, all in one place.</p></div>
        <div className="inbox-count"><strong>{unreadCount}</strong><span>unread</span></div>
      </section>
      <section className="inbox-toolbar">
        <div className="inbox-tabs" role="tablist" aria-label="Notification filter">
          <button className={filter === 'ALL' ? 'selected' : ''} onClick={() => setFilter('ALL')}>All <span>{notifications.length}</span></button>
          <button className={filter === 'UNREAD' ? 'selected' : ''} onClick={() => setFilter('UNREAD')}>Unread <span>{unreadCount}</span></button>
        </div>
        <label className="inbox-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications" /></label>
      </section>
      <section className="inbox-results">
        {error && <p className="error">{error}</p>}
        {loading ? <div className="loading-row">Loading inbox…</div> : visibleNotifications.length === 0 ? (
          <div className="inbox-empty"><span aria-hidden="true">⌁</span><h2>{notifications.length === 0 ? 'Your inbox is clear' : 'No matching updates'}</h2><p>{notifications.length === 0 ? 'New appointment and care updates will arrive here.' : 'Try another search or view all notifications.'}</p></div>
        ) : (
          <div className="notification-list">
            {visibleNotifications.map((notification) => (
              <article className={`notification-item inbox-item ${notification.read ? 'is-read' : ''}`} key={notification.id}>
                <div>
                  <div className="inbox-item-title"><span className={`notification-dot ${notification.read ? 'read' : ''}`} /><strong>{notification.title}</strong></div>
                  <p>{notification.message}</p>
                  <time dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString()}</time>
                </div>
                {!notification.read && <button className="button secondary" onClick={() => markRead(notification.id)}>Mark read</button>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
