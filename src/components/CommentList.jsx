export function CommentList({ comments }) {
  if (!comments.length) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-900/15 bg-white/60 px-5 py-7 text-center text-sm text-stone-500">
        No comments yet.
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {comments.map((comment) => (
        <article
          key={comment.id}
          className="grid gap-2 rounded-2xl border border-stone-900/10 bg-white/85 p-4 shadow-[0_10px_30px_rgba(39,22,11,0.12)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="m-0 font-semibold text-stone-950">{comment.name}</p>
            <span className="text-sm text-stone-500">{comment.email}</span>
          </div>
          <p className="m-0 whitespace-pre-wrap text-stone-700">{comment.body}</p>
        </article>
      ))}
    </div>
  )
}