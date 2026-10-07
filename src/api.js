const ORDER = { high: 0, medium: 1, low: 2 }

export async function extractTasks(transcript) {
  const today = new Date().toLocaleDateString('en-CA')
  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, today }),
    signal: AbortSignal.timeout(100000),
  }).catch(() => {
    throw new Error('The AI took too long to respond. Please try again.')
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong')

  return data.tasks
    .map((t) => ({ ...t, id: crypto.randomUUID(), status: 'todo' }))
    .sort((a, b) => ORDER[a.priority] - ORDER[b.priority])
}