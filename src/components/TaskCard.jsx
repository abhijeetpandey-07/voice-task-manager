import { useState } from 'react'

const PRIORITY_STYLES = {
  high: 'bg-red-500/20 text-red-300',
  medium: 'bg-amber-500/20 text-amber-300',
  low: 'bg-emerald-500/20 text-emerald-300',
}

function parseDate(d) {
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day)
}

function formatDate(d) {
  if (!d) return 'No due date'
  return parseDate(d).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isOverdue(d) {
  if (!d) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parseDate(d) < today
}

export default function TaskCard({ task, dragging, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task)

  const save = () => {
    onUpdate(task.id, {
      title: draft.title.trim() || task.title,
      priority: draft.priority,
      dueDate: draft.dueDate || null,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="space-y-2 rounded-xl bg-slate-800 p-3 ring-2 ring-indigo-400">
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full rounded bg-slate-700 p-2 text-sm outline-none"
        />
        <div className="flex gap-2">
          <select
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
            className="flex-1 rounded bg-slate-700 p-2 text-sm"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="date"
            value={draft.dueDate || ''}
            onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
            className="flex-1 rounded bg-slate-700 p-2 text-sm [color-scheme:dark]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setEditing(false)} className="text-sm text-slate-400">
            Cancel
          </button>
          <button onClick={save} className="rounded bg-indigo-500 px-3 py-1 text-sm font-semibold">
            Save
          </button>
        </div>
      </div>
    )
  }

  const overdue = task.status !== 'done' && isOverdue(task.dueDate)

  return (
    <div className={`rounded-xl bg-slate-800 p-3 ${dragging ? 'ring-2 ring-indigo-400' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`font-medium ${task.status === 'done' ? 'text-slate-500 line-through' : ''}`}>
          {task.title}
        </p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>
      {task.notes && <p className="mt-1 text-xs text-slate-400">{task.notes}</p>}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={overdue ? 'text-red-400' : 'text-slate-400'}>
          📅 {formatDate(task.dueDate)}
          {overdue ? ' (overdue)' : ''}
        </span>
        <span className="flex gap-3">
          <button
            onClick={() => {
              setDraft(task)
              setEditing(true)
            }}
          >
            ✏️
          </button>
          <button onClick={() => onDelete(task.id)}>🗑️</button>
        </span>
      </div>
    </div>
  )
}