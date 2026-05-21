import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CommentList } from '../components/CommentList.jsx'
import { PostForm } from '../components/PostForm.jsx'
import { StatusMessage } from '../components/StatusMessage.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { usePosts } from '../context/PostsContext.jsx'
import { createComment, getCommentsByPost } from '../services/jsonplaceholder.js'

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

function validateComment(name, email, body) {
  if (!name.trim() || !email.trim() || !body.trim()) {
    return 'All comment fields are required.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Enter a valid email address for the comment.'
  }

  if (body.trim().length < 3) {
    return 'Comment body must be at least 3 characters long.'
  }

  return ''
}

export function PostDetailPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { posts, postsLoading, updatePost, deletePost } = usePosts()

  const numericPostId = Number(postId)
  const post = useMemo(
    () => posts.find((candidate) => candidate.id === numericPostId),
    [posts, numericPostId],
  )

  if (postsLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <span className="h-3 w-3 animate-pulse rounded-full bg-orange-700" />
        Loading post...
      </div>
    )
  }

  if (!post) {
    return (
      <div className="space-y-4 rounded-3xl border border-stone-900/10 bg-white/85 p-6 shadow-[0_10px_30px_rgba(39,22,11,0.12)] backdrop-blur-xl">
        <StatusMessage
          title="Post not found"
          message="The post you are looking for no longer exists in the current UI state."
          tone="error"
        />
        <Link
          className="inline-flex w-fit items-center justify-center rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-2.5 text-sm font-medium text-stone-950 no-underline transition hover:-translate-y-px"
          to="/posts"
        >
          Back to posts
        </Link>
      </div>
    )
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <PostDetailsPanel
        key={post.id}
        post={post}
        user={user}
        onUpdate={updatePost}
        onDelete={deletePost}
        navigate={navigate}
      />

      <CommentsSection
        key={`${post.id}-${user?.id ?? 'guest'}`}
        postId={numericPostId}
        user={user}
      />
    </section>
  )
}

function PostDetailsPanel({ post, user, onUpdate, onDelete, navigate }) {
  const ownedByCurrentUser = user ? post.userId === user.id : false
  const [editMode, setEditMode] = useState(false)
  const [editError, setEditError] = useState('')
  const [editBusy, setEditBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const { notify } = useNotifications()

  async function handleSavePost(values) {
    if (!user) {
      setEditError('Login required to edit posts.')
      notify('Login required to edit posts.', 'error')
      return
    }

    if (!ownedByCurrentUser) {
      setEditError('You can only edit your own posts.')
      notify('You can only edit your own posts.', 'error')
      return
    }

    const validationError = validatePost(values.title, values.body)

    if (validationError) {
      setEditError(validationError)
      notify(validationError, 'error')
      return
    }

    try {
      setEditBusy(true)
      setEditError('')
      await onUpdate(post.id, {
        title: values.title,
        body: values.body,
        userId: post.userId,
      })
      setEditMode(false)
      notify(`Post updated: ${values.title}`, 'success')
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : 'Unable to update post.',
      )
      notify(
        error instanceof Error ? error.message : 'Unable to update post.',
        'error',
      )
    } finally {
      setEditBusy(false)
    }
  }

  async function handleDeletePost() {
    if (!user || !ownedByCurrentUser) {
      notify('You can only delete your own posts.', 'error')
      return
    }

    const confirmed = globalThis.confirm(
      'Delete this post? This action cannot be undone.',
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleteBusy(true)
      await onDelete(post.id)
      navigate('/posts', { replace: true })
      notify(`Post deleted: ${post.title}`, 'info')
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : 'Unable to delete post.',
      )
      notify(
        error instanceof Error ? error.message : 'Unable to delete post.',
        'error',
      )
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <article className="grid gap-4 h-max rounded-3xl border border-stone-900/10 bg-white/85 p-6 shadow-[0_10px_30px_rgba(39,22,11,0.12)] backdrop-blur-xl">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              ownedByCurrentUser
                ? 'border-orange-200 bg-orange-50 text-orange-800'
                : 'border-stone-900/10 bg-white/80 text-stone-500'
            }`}
          >
            User ID {post.userId}
          </span>
          {ownedByCurrentUser ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800">
              Your post
            </span>
          ) : null}
        </div>
        <h2 className="m-0 font-serif text-3xl leading-tight text-stone-950">{post.title}</h2>
        <p className="m-0 whitespace-pre-wrap text-stone-700">{post.body}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          className="inline-flex items-center justify-center rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-2.5 text-sm font-medium text-stone-950 no-underline transition hover:-translate-y-px"
          to="/posts"
        >
          Back to feed
        </Link>
        {ownedByCurrentUser ? (
          <>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-2.5 text-sm font-medium text-stone-950 transition hover:-translate-y-px"
              onClick={() => setEditMode((value) => !value)}
            >
              {editMode ? 'Hide edit form' : 'Edit post'}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-950 to-red-800 px-4 py-2.5 text-sm font-medium text-[#fffdf9] shadow-[0_14px_30px_rgba(180,35,24,0.18)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
              onClick={handleDeletePost}
              disabled={deleteBusy}
            >
              {deleteBusy ? 'Deleting...' : 'Delete post'}
            </button>
          </>
        ) : null}
      </div>

      {editError ? (
        <div className="rounded-2xl border border-red-900/15 bg-red-950/5 px-4 py-3 text-sm text-red-700">
          {editError}
        </div>
      ) : null}

      {editMode && ownedByCurrentUser ? (
        <PostForm
          title={post.title}
          body={post.body}
          submitLabel="Save Changes"
          helperText="The form is prefilled from the current post and sends a PUT request on save."
          busy={editBusy}
          error={editError}
          onSubmit={handleSavePost}
        />
      ) : null}
    </article>
  )
}

function CommentsSection({ postId, user }) {
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsError, setCommentsError] = useState('')
  const [commentBusy, setCommentBusy] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [commentName, setCommentName] = useState(user?.name ?? '')
  const [commentEmail, setCommentEmail] = useState(user?.email ?? '')
  const [commentBody, setCommentBody] = useState('')
  const { notify } = useNotifications()

  useEffect(() => {
    let active = true

    async function loadComments() {
      try {
        setCommentsLoading(true)
        const data = await getCommentsByPost(postId)
        if (active) {
          setComments(data)
        }
      } catch (error) {
        if (active) {
          setCommentsError(
            error instanceof Error ? error.message : 'Unable to load comments.',
          )
        }
      } finally {
        if (active) {
          setCommentsLoading(false)
        }
      }
    }

    loadComments()

    return () => {
      active = false
    }
  }, [postId])

  async function handleAddComment(event) {
    event.preventDefault()

    if (!user) {
      setCommentError('Login required to add comments.')
      notify('Login required to add comments.', 'error')
      return
    }

    const validationError = validateComment(commentName, commentEmail, commentBody)

    if (validationError) {
      setCommentError(validationError)
      notify(validationError, 'error')
      return
    }

    try {
      setCommentBusy(true)
      setCommentError('')

      const createdComment = await createComment({
        postId,
        name: commentName.trim(),
        email: commentEmail.trim(),
        body: commentBody.trim(),
      })

      setComments((currentComments) => [createdComment, ...currentComments])
      setCommentBody('')
      notify('Comment posted successfully.', 'success')
    } catch (error) {
      setCommentError(
        error instanceof Error ? error.message : 'Unable to add comment.',
      )
      notify(
        error instanceof Error ? error.message : 'Unable to add comment.',
        'error',
      )
    } finally {
      setCommentBusy(false)
    }
  }

  return (
    <aside className="grid gap-4 rounded-3xl border border-stone-900/10 bg-white/85 p-6 shadow-[0_10px_30px_rgba(39,22,11,0.12)] backdrop-blur-xl">
      <div className="space-y-1">
        <h3 className="m-0 font-serif text-xl text-stone-950">Comments</h3>
        <p className="m-0 text-sm text-stone-500">
          Comments are loaded from the API and only logged-in users can add new
          ones.
        </p>
      </div>

      {commentsLoading ? (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span className="h-3 w-3 animate-pulse rounded-full bg-orange-700" />Loading comments...
        </div>
      ) : null}
      {commentsError ? (
        <div className="rounded-2xl border border-red-900/15 bg-red-950/5 px-4 py-3 text-sm text-red-700">
          {commentsError}
        </div>
      ) : null}

      {!commentsLoading && !commentsError ? <CommentList comments={comments} /> : null}

      {user ? (
        <form className="grid gap-4" onSubmit={handleAddComment}>
          <h4 className="m-0 font-serif text-xl text-stone-950">Add a comment</h4>
          {commentError ? (
            <div className="rounded-2xl border border-red-900/15 bg-red-950/5 px-4 py-3 text-sm text-red-700">
              {commentError}
            </div>
          ) : null}

          <label className="grid gap-2">
            <span className="font-medium text-stone-950">Name</span>
            <input
              type="text"
              value={commentName}
              onChange={(event) => setCommentName(event.target.value)}
              className="w-full rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3 text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-200/30"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium text-stone-950">Email</span>
            <input
              type="email"
              value={commentEmail}
              onChange={(event) => setCommentEmail(event.target.value)}
              className="w-full rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3 text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-200/30"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium text-stone-950">Comment</span>
            <textarea
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder="Write your comment"
              className="min-h-36 w-full resize-y rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3 text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-200/30"
            />
          </label>

          <button
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-stone-800 to-orange-700 px-5 py-3 font-medium text-[#fffdf9] shadow-[0_14px_30px_rgba(198,95,46,0.18)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={commentBusy}
          >
            {commentBusy ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <StatusMessage
          title="Login required"
          message="Guests can read comments, but they cannot add new ones."
        />
      )}
    </aside>
  )
}
