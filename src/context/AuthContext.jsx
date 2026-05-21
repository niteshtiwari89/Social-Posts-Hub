/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getUsers } from '../services/jsonplaceholder.js'
import { useNotifications } from './NotificationContext.jsx'

const AUTH_STORAGE_KEY = 'mini-social-auth-user'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState('')
  const { notify } = useNotifications()

  useEffect(() => {
    let active = true

    async function loadUsers() {
      try {
        const data = await getUsers()
        if (active) {
          setUsers(data)
        }
      } catch (error) {
        if (active) {
          setUsersError(
            error instanceof Error ? error.message : 'Unable to load users.',
          )
        }
      } finally {
        if (active) {
          setUsersLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      return
    }

    localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [user])

  const login = useCallback(({ email, username }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim().toLowerCase()

    const matchedUser = users.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail &&
        candidate.username.toLowerCase() === normalizedUsername,
    )

    if (!matchedUser) {
      throw new Error('No user matches that email and username.')
    }

    setUser(matchedUser)
    notify(`Welcome back, ${matchedUser.name}.`, 'success')
    return matchedUser
  }, [notify, users])

  const logout = useCallback(() => {
    const previousName = user?.name ?? 'Guest User'
    setUser(null)
    notify(`${previousName} logged out successfully.`, 'info')
  }, [notify, user])

  const value = useMemo(
    () => ({
      user,
      users,
      usersLoading,
      usersError,
      login,
      logout,
      setUser,
    }),
    [login, logout, user, users, usersLoading, usersError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}