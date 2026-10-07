import { useEffect, useState } from 'react'
import useSpeech from './hooks/useSpeech'
import { extractTasks } from './api'
import Board from './components/Board'
import { downloadICS } from './utils/ics'

const SAMPLE =
  "Tomorrow I need to send the project report to Rahul, it's urgent. Also call the dentist on Friday to book an appointment. Maybe plan the weekend trip sometime next week, and buy groceries tonight."
export default function App() {
  const { transcript, setTranscript, listening, toggle, error: micError } = useSpeech()
    const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('voicetask-tasks')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('voicetask-tasks', JSON.stringify(tasks))
    } catch {
      // ignore storage errors
    }
  }, [tasks])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleExtract = async () => {
    if (!transcript.trim()) return
    setLoading(true)
    setError('')
    try {
      const newTasks = await extractTasks(transcript)
      if (newTasks.length === 0) setError('No tasks found in that note. Try again.')
      setTasks((prev) => [...newTasks, ...prev])
      if (newTasks.length > 0) setTranscript('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const moveTask = (id, status, index) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id)
      const rest = prev.filter((t) => t.id !== id)
      const moved = { ...task, status }
      const target = rest.filter((t) => t.status === status)[index]
      if (!target) return [...rest, moved]
      const pos = rest.indexOf(target)
      return [...rest.slice(0, pos), moved, ...rest.slice(pos)]
    })
  }

  const updateTask = (id, changes) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)))

  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id))

  const exportable = tasks.filter((t) => t.dueDate && t.status !== 'done')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-2xl font-bold">
          Voice<span className="text-indigo-400">Task</span>
        </h1>
        <p className="text-sm text-slate-400">
          Speak your chaos. Get a prioritized task board.
        </p>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        <section className="flex flex-col items-center gap-4 rounded-2xl bg-slate-900 p-8">
          <button
            onClick={toggle}
            className={`h-20 w-20 rounded-full text-3xl transition ${
              listening ? 'animate-pulse bg-red-500' : 'bg-indigo-500 hover:bg-indigo-400'
            }`}
          >
            🎤
          </button>
          <p className="text-sm text-slate-400">
            {listening ? 'Listening... tap again to stop' : 'Tap the mic and talk through your day'}
          </p>
          {(micError || error) && <p className="text-sm text-red-400">{micError || error}</p>}
                    <button
            onClick={() => setTranscript(SAMPLE)}
            className="text-xs text-slate-500 underline hover:text-slate-300"
          >
            Use a sample note
          </button>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your live transcript appears here (or type a note)..."
            className="h-32 w-full rounded-lg bg-slate-800 p-3 text-slate-100 outline-none"
          />
          <button
            onClick={handleExtract}
            disabled={loading || !transcript.trim()}
            className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40"
          >
            {loading ? 'Thinking...' : 'Extract Tasks'}
          </button>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your board</h2>
            <button
              onClick={() => downloadICS(exportable)}
              disabled={exportable.length === 0}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-40"
            >
              📅 Export to calendar
            </button>
          </div>
          <Board tasks={tasks} onMove={moveTask} onUpdate={updateTask} onDelete={deleteTask} />
        </section>
      </main>
    </div>
  )
}