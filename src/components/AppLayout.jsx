import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    if (location.pathname !== '/posts') {
      navigate('/posts')
    }
  }

  return (
    <div className="min-h-screen text-stone-800">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(198,95,46,0.12),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(31,122,75,0.10),_transparent_30%),linear-gradient(180deg,#f9f5ef_0%,#f5f1ea_100%)]"
      />

      <div className="relative mx-auto w-[min(1180px,calc(100%-1.5rem))] pb-10 pt-3 sm:pb-12 sm:pt-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-stone-900/10 bg-white/85 p-4 shadow-[0_10px_30px_rgba(39,22,11,0.12)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <Link to="/posts" className="flex items-center gap-4 no-underline">
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br from-stone-800 to-orange-700 text-lg font-semibold text-[#fffdf9] shadow-[0_12px_24px_rgba(198,95,46,0.26)]">
              S
            </span>
            <span>
              <h1 className="m-0 font-serif text-[1.4rem] text-stone-950">
                Social Posts Hub
              </h1>
              
            </span>
          </Link>

          <div className="flex flex-col gap-3 sm:items-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white/75 px-4 py-2 text-sm text-stone-950">
              Signed in as <strong>{user?.name ?? 'Guest User'}</strong>
            </span>
            <nav className="flex flex-wrap items-center gap-2" aria-label="Main navigation">
              <NavLink
                to="/posts"
                className={({ isActive }) =>
                  [
                    'rounded-2xl border px-4 py-2.5 text-sm font-medium no-underline transition hover:-translate-y-px',
                    isActive
                      ? 'border-orange-200 bg-white shadow-[0_10px_24px_rgba(198,95,46,0.12)]'
                      : 'border-stone-900/10 bg-white/75 text-stone-950',
                  ].join(' ')
                }
              >
                Posts
              </NavLink>
             
              {user ? (
                
                <button
                  type="button"
                  className="rounded-2xl border border-stone-900/10 bg-white/75 px-4 py-2.5 text-sm font-medium text-stone-950 transition hover:-translate-y-px"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : <NavLink
                to="/login"
                className={({ isActive }) =>
                  [
                    'rounded-2xl border px-4 py-2.5 text-sm font-medium no-underline transition hover:-translate-y-px',
                    isActive
                      ? 'border-orange-200 bg-white shadow-[0_10px_24px_rgba(198,95,46,0.12)]'
                      : 'border-stone-900/10 bg-white/75 text-stone-950',
                  ].join(' ')
                }
              >
                Login
              </NavLink>}
            </nav>
          </div>
        </header>

        <main className="mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}