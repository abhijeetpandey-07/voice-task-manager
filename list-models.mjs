const key = process.env.GEMINI_API_KEY
const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {
  headers: { 'x-goog-api-key': key },
})
const data = await r.json()
if (!r.ok) console.log('Error:', data?.error?.message)
for (const m of data.models || []) {
  if (m.supportedGenerationMethods?.includes('generateContent')) {
    console.log(m.name.replace('models/', ''))
  }
}