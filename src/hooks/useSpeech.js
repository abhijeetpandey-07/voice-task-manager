import { useEffect, useRef, useState } from 'react'

export default function useSpeech() {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const recRef = useRef(null)
  const baseRef = useRef('')
  const textRef = useRef('')

  useEffect(() => {
    textRef.current = transcript
  }, [transcript])

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('Speech recognition is not supported here. Use Chrome or Edge, or type your note.')
      return
    }
    setError('')
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    baseRef.current = textRef.current ? textRef.current.trim() + ' ' : ''
    let finalText = ''

    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t + ' '
        else interim += t
      }
      setTranscript(baseRef.current + finalText + interim)
    }
    rec.onerror = (e) => {
      setError(`Mic error: ${e.error}`)
      setListening(false)
    }
    rec.onend = () => setListening(false)

    rec.start()
    recRef.current = rec
    setListening(true)
  }

  const stop = () => recRef.current?.stop()
  const toggle = () => (listening ? stop() : start())

  return { transcript, setTranscript, listening, toggle, error }
}