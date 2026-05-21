import { Link } from 'react-router-dom'

export function PostCard({ post, isOwnedByCurrentUser }) {
  return (
    <article
      className={`grid gap-4 rounded-3xl border p-5 shadow-[0_10px_30px_rgba(39,22,11,0.12)] backdrop-blur-xl ${
        isOwnedByCurrentUser
          ? 'border-orange-300 bg-gradient-to-b from-orange-50 to-white shadow-[0_20px_50px_rgba(198,95,46,0.10)]'
          : 'border-stone-900/10 bg-white/85'
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            isOwnedByCurrentUser
              ? 'border-orange-200 bg-orange-50 text-orange-800'
              : 'border-stone-900/10 bg-white/80 text-stone-500'
          }`}
        >
          User ID {post.userId}
        </span>
        {isOwnedByCurrentUser ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800">
            Your post
          </span>
        ) : null}
      </div>

      <div>
        <h3 className="m-0 text-[1.15rem] font-serif text-stone-950">{post.title}</h3>
        <p className="mt-2 whitespace-pre-wrap text-stone-700">{post.body}</p>
      </div>

      <div>
        <Link
          className="inline-flex items-center justify-center rounded-2xl border border-stone-900/10 bg-white/80 px-4 py-2.5 text-sm font-medium text-stone-950 no-underline transition hover:-translate-y-px"
          to={`/posts/${post.id}`}
        >
          View details
        </Link>
      </div>
    </article>
  )
}