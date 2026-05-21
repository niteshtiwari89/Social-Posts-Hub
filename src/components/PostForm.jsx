import { useState } from 'react'

export function PostForm({
  title: initialTitle = '',
  body: initialBody = '',
  onSubmit,
  submitLabel,
  busy = false,
  error = '',
  helperText = '',
}) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)

  async function handleSubmit(event) {
    event.preventDefault()
    await onSubmit({ title, body })
  }

  return (
    <form
      className="space-y-4 rounded-3xl border border-stone-900/10 bg-white/85 p-5 shadow-[0_10px_30px_rgba(39,22,11,0.12)] backdrop-blur-xl"
      onSubmit={handleSubmit}
    >
      <div className="space-y-1">
        <h3 className="m-0 font-serif text-xl text-stone-950">{submitLabel}</h3>
        {helperText ? <p className="m-0 text-sm text-stone-500">{helperText}</p> : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-900/15 bg-red-950/5 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <label className="grid gap-2">
        <span className="font-medium text-stone-950">Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Write a post title"
          maxLength={120}
          className="w-full rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3 text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-200/30"
        />
      </label>

      <label className="grid gap-2">
        <span className="font-medium text-stone-950">Body</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Share your post body"
          maxLength={2000}
          className="min-h-36 w-full resize-y rounded-2xl border border-stone-900/10 bg-white/90 px-4 py-3 text-stone-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-200/30"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-stone-800 to-orange-700 px-5 py-3 font-medium text-[#fffdf9] shadow-[0_14px_30px_rgba(198,95,46,0.18)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={busy}
        >
          {busy ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}