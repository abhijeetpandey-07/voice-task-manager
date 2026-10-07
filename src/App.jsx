import useSpeech from './hooks/useSpeech'

export default function App() {
  const { transcript, setTranscript, listening, toggle, error } = useSpeech()

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
          {error && <p className="text-sm text-red-400">{error}</p>}
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your live transcript appears here (or type a note)..."
            className="h-32 w-full rounded-lg bg-slate-800 p-3 text-slate-100 outline-none"
          />
          <button className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-slate-950 hover:bg-emerald-400">
            Extract Tasks
          </button>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {['To Do', 'In Progress', 'Done'].map((col) => (
            <div key={col} className="rounded-2xl bg-slate-900 p-4">
              <h2 className="mb-3 font-semibold">{col}</h2>
              <p className="text-sm text-slate-500">No tasks yet</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}