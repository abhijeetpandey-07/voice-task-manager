const pad = (n) => String(n).padStart(2, '0')

function escapeText(s = '') {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function toBasic(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
}

function parseDate(d) {
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day)
}

export function buildICS(tasks) {
  const now = new Date()
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(
    now.getUTCHours(),
  )}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`

  const events = tasks
    .filter((t) => t.dueDate)
    .map((t) => {
      const start = parseDate(t.dueDate)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      return [
        'BEGIN:VEVENT',
        `UID:${t.id}@voicetask`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${toBasic(start)}`,
        `DTEND;VALUE=DATE:${toBasic(end)}`,
        `SUMMARY:${escapeText(t.title)}`,
        `DESCRIPTION:${escapeText(`Priority: ${t.priority}. ${t.notes || ''}`)}`,
        'END:VEVENT',
      ].join('\r\n')
    })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VoiceTask//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadICS(tasks) {
  const blob = new Blob([buildICS(tasks)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'voicetask-tasks.ics'
  a.click()
  URL.revokeObjectURL(url)
}