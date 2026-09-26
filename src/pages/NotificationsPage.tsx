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

  const loadNotifications = () => api.get('/notifications')
    .then((response) => setNotifications(response.data))
    .catch(() => setError('Unable to load notifications.'))

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

  return (
    <main className="page shell">
      <section className="card">
        <h1>Notifications</h1>
        {error && <p className="error">{error}</p>}
        {notifications.length === 0 ? (
          <p className="empty-state">No notifications yet.</p>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <article className={`notification-item ${notification.read ? 'is-read' : ''}`} key={notification.id}>
                <div>
                  <strong>{notification.title}</strong>
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
