import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { usePosts } from '../context/PostsContext.jsx'
import { PostCard } from '../components/PostCard.jsx'
import { PostForm } from '../components/PostForm.jsx'

function validatePost(title, body) {
  if (!title.trim() || !body.trim()) {
    return 'Title and body are required.'
  }

  if (title.trim().length < 3) {
    return 'Title must be at least 3 characters long.'
  }

  if (body.trim().length < 10) {
    return 'Body must be at least 10 characters long.'
  }

  return ''
}

export function PostsPage() {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const { posts, postsLoading, postsError, createPost } = usePosts()
  const [createError, setCreateError] = useState('')
  const [createBusy, setCreateBusy] = useState(false)
  const [createFormVersion, setCreateFormVersion] = useState(0)
  const [search, setSearch] = useState('')

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return posts
    }

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query) ||
        String(post.userId).includes(query),
    )
  }, [posts, search])

  const isOwnedByCurrentUser = (post) => Boolean(user && post.userId === user.id)

  async function handleCreatePost(values) {
    if (!user) {
      setCreateError('Login required to create a post.')
      notify('Login required to create a post.', 'error')
      return
    }

    const validationError = validatePost(values.title, values.body)

    if (validationError) {
      setCreateError(validationError)
      notify(validationError, 'error')
      return
    }

    try {
      setCreateBusy(true)
      setCreateError('')
      await createPost({
        title: values.title,
        body: values.body,
        userId: user.id,
      })
      setCreateFormVersion((version) => version + 1)
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Unable to create post.',
      )
      notify(
        error instanceof Error ? error.message : 'Unable to create post.',
        'error',
      )
    } finally {
      setCreateBusy(false)
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-4 rounded-3xl border border-stone-900/10 bg-white/85 p-6 shadow-[0_10px_30px_rgba(39,22,11,0.12)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-orange-800">
            Logged As {user?.name ?? 'Guest User'}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-stone-500">
            {posts.length} posts loaded
          </span>
        </div>
        <h2 className="m-0 font-serif text-[clamp(1.8rem,3vw,3rem)] leading-tight text-stone-950">
          Browse a mini social feed and manage your own posts
        </h2>
        <p className="m-0 text-stone-500">
          Posts are fetched from JSONPlaceholder.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="w-full rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3 text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-200/30 sm:max-w-[340px]"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search title, body, or user id"
        />
        <span className="text-sm text-stone-500">
          Guest users can view the feed. Login unlocks post creation.
        </span>
      </div>

      {user ? (
        <PostForm
          key={createFormVersion}
          submitLabel="Create Post"
          helperText="This sends a POST request and updates the feed immediately."
          busy={createBusy}
          error={createError}
          onSubmit={handleCreatePost}
        />
      ) : (
        <div className="rounded-2xl border border-stone-900/10 bg-white/70 px-4 py-3 text-sm text-stone-500">
          <strong className="text-stone-950">Login required.</strong> Guests can only view posts.
        </div>
      )}

      {postsLoading ? (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span className="h-3 w-3 animate-pulse rounded-full bg-orange-700" />
          Loading posts...
        </div>
      ) : null}
      {postsError ? (
        <div className="rounded-2xl border border-red-900/15 bg-red-950/5 px-4 py-3 text-sm text-red-700">
          {postsError}
        </div>
      ) : null}

      {!postsLoading && !postsError ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwnedByCurrentUser={isOwnedByCurrentUser(post)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}