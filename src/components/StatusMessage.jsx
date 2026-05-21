export function StatusMessage({ title, message, tone = 'info' }) {
  const toneClasses = {
    error: 'border-red-900/15 bg-red-950/5 text-red-700',
    success: 'border-emerald-900/15 bg-emerald-950/5 text-emerald-700',
    info: 'border-emerald-900/15 bg-emerald-950/5 text-emerald-700',
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses[tone] ?? toneClasses.info}`}>
      <strong className="block text-base">{title}</strong>
      {message ? <div className="mt-1">{message}</div> : null}
    </div>
  )
}