/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'

const NotificationContext = createContext(null)

let nextNotificationId = 1

function buildNotification(message, type = 'info') {
  return {
    id: nextNotificationId++,
    message,
    type,
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  function notify(message, type = 'info') {
    const notification = buildNotification(message, type)
    setNotifications((currentNotifications) => [notification, ...currentNotifications].slice(0, 4))

    globalThis.setTimeout(() => {
      setNotifications((currentNotifications) =>
        currentNotifications.filter((item) => item.id !== notification.id),
      )
    }, 3000)

    return notification.id
  }

  function dismiss(id) {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((item) => item.id !== id),
    )
  }

  const value = useMemo(
    () => ({
      notify,
      dismiss,
    }),
    [],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(100%-2rem,24rem)] flex-col gap-3 sm:right-6 sm:top-6">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_18px_50px_rgba(39,22,11,0.18)] backdrop-blur-xl ${
              notification.type === 'error'
                ? 'border-red-900/15 bg-red-950/95 text-red-50'
                : notification.type === 'success'
                  ? 'border-emerald-900/15 bg-emerald-950/95 text-emerald-50'
                  : 'border-stone-900/10 bg-stone-950/95 text-stone-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 text-sm leading-6">{notification.message}</div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-xs font-semibold text-inherit transition hover:bg-white/10"
                onClick={() => dismiss(notification.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }

  return context
}