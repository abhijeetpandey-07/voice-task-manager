export default function TaskCard({ task, dragging }) {
  return (
    <div className={`rounded-xl bg-slate-800 p-3 ${dragging ? 'ring-2 ring-indigo-400' : ''}`}>
      <p className="font-medium">{task.title}</p>
      <p className="mt-1 text-xs text-slate-400">
        {task.priority} · {task.dueDate || 'no date'}
      </p>
    </div>
  )
}