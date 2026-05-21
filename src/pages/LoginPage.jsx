import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function LoginPage() {
  const { user, login, usersLoading, usersError } = useAuth()
  const { notify } = useNotifications()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/posts" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    const trimmedUsername = username.trim()

    if (!trimmedEmail || !trimmedUsername) {
      setError('Email and username are required.')
      notify('Email and username are required to log in.', 'error')
      return
    }

    if (!isEmail(trimmedEmail)) {
      setError('Enter a valid email address.')
      notify('Enter a valid email address to log in.', 'error')
      return
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long.')
      notify('Username must be at least 3 characters long.', 'error')
      return
    }

    try {
      setSubmitting(true)
      login({ email: trimmedEmail, username: trimmedUsername })
      navigate('/posts', { replace: true })
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Login failed. Please try again.',
      )
      notify(
        loginError instanceof Error
          ? loginError.message
          : 'Login failed. Please try again.',
        'error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-4 rounded-3xl border border-stone-900/10 bg-white/85 p-6 shadow-[0_10px_30px_rgba(39,22,11,0.12)] backdrop-blur-xl">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-orange-800">
          Mock authentication
        </span>
        <h2 className="m-0 font-serif text-[clamp(1.8rem,3vw,3rem)] leading-tight text-stone-950">
          Sign in with a JSONPlaceholder user
        </h2>
        <p className="m-0 text-stone-500">
          Enter a matching email and username from the fetched user list. The
          login is stored in localStorage and stays active after refresh.
        </p>
      </div>

      <form
        className="space-y-4 rounded-3xl border border-stone-900/10 bg-white/85 p-6 shadow-[0_10px_30px_rgba(39,22,11,0.12)] backdrop-blur-xl"
        onSubmit={handleSubmit}
      >
        <div className="space-y-1">
          <h3 className="m-0 font-serif text-xl text-stone-950">Login</h3>
          <p className="m-0 text-sm text-stone-500">
            Guests can browse posts, but only logged-in users can create, edit,
            delete, and comment.
          </p>
        </div>

        {usersLoading ? (
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <span className="h-3 w-3 animate-pulse rounded-full bg-orange-700" />
            Loading users...
          </div>
        ) : null}
        {usersError ? (
          <div className="rounded-2xl border border-red-900/15 bg-red-950/5 px-4 py-3 text-sm text-red-700">
            {usersError}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-red-900/15 bg-red-950/5 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <label className="grid gap-2">
          <span className="font-medium text-stone-950">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter the user email"
            autoComplete="email"
            className="w-full rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3 text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-200/30"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-medium text-stone-950">Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter the matching username"
            autoComplete="username"
            className="w-full rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3 text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-200/30"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-stone-800 to-orange-700 px-5 py-3 font-medium text-[#fffdf9] shadow-[0_14px_30px_rgba(198,95,46,0.18)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={submitting || usersLoading}
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
          <span className="text-sm text-stone-500">
            Use the users returned by the API, such as Leanne Graham / Bret.
          </span>
        </div>
      </form>
    </section>
  )
}