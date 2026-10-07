const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const RETRY_STATUS = [429, 500, 503, 504]

async function callGemini({ key, models, system, transcript }) {
  let lastError = 'Gemini is busy. Please try again.'

  for (let attempt = 0; attempt < 2; attempt++) {
    const model = models[attempt % models.length]
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          signal: AbortSignal.timeout(40000),
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: transcript }] }],
            generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
          }),
        },
      )

      if (r.ok) {
        const data = await r.json()
        return data.candidates?.[0]?.content?.parts?.[0]?.text
      }

      const body = await r.json().catch(() => ({}))
      lastError = `Gemini error ${r.status}: ${body?.error?.message || 'unknown error'}`
      console.error(lastError, `(model: ${model}, attempt ${attempt + 1})`)
      if (!RETRY_STATUS.includes(r.status)) break
    } catch (e) {
      lastError = 'Gemini did not respond in time.'
      console.error(lastError, `(model: ${model}, attempt ${attempt + 1})`)
    }
    await sleep(1500 * (attempt + 1))
  }

  throw new Error(lastError)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { transcript, today } = req.body || {}
  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: 'Transcript is empty' })
  }

  const geminiKey = process.env.GEMINI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  if (!geminiKey && !openaiKey) {
    return res.status(500).json({ error: 'Server is missing an API key' })
  }

  const system = `You turn messy voice-note transcripts into tasks.
Today's date is ${today || new Date().toISOString().slice(0, 10)}.
Return ONLY JSON in this exact shape:
{"tasks":[{"title":"short action phrase","priority":"high|medium|low","dueDate":"YYYY-MM-DD or null","notes":"optional extra detail or empty string"}]}
Rules:
- One task per distinct action item. Ignore filler words.
- priority: "high" if urgent, important or due very soon; "low" if "maybe" or "someday"; otherwise "medium".
- Convert relative dates ("tomorrow", "Friday", "next week") to YYYY-MM-DD using today's date. Use null if no date is mentioned.
- Do not invent tasks that were not said.`

  try {
    let text

    if (geminiKey) {
      const models = [
        process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        process.env.GEMINI_FALLBACK_MODEL,
      ].filter(Boolean)
      text = await callGemini({ key: geminiKey, models, system, transcript })
    } else {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: transcript },
          ],
        }),
      })
      if (!r.ok) {
        return res.status(502).json({ error: 'OpenAI request failed. Check your key and credits.' })
      }
      const data = await r.json()
      text = data.choices?.[0]?.message?.content
    }

    const parsed = JSON.parse(text)
    const tasks = (parsed.tasks || []).map((t) => ({
      title: String(t.title || 'Untitled task'),
      priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate || '') ? t.dueDate : null,
      notes: String(t.notes || ''),
    }))
    return res.status(200).json({ tasks })
  } catch (err) {
    return res.status(502).json({
      error: err.message || 'Could not extract tasks. Please try again.',
    })
  }
}