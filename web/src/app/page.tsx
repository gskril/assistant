'use client'

import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

import { submitAudio } from './actions'

type AudioData = {
  url: string
  blob: Blob
}

export default function Home() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioData, setAudioData] = useState<AudioData | null>(null)
  const [formData, setFormData] = useState<FormData>(new FormData())

  const handleRecordClick = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      mediaRecorderRef.current = new MediaRecorder(audioStream)

      const chunks: Blob[] = []
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      })

      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioData({ url: audioUrl, blob: audioBlob })
      })

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing audio stream:', error)
    }
  }

  const handleStopClick = async () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSaveClick = async () => {
    if (audioData) {
      console.log(audioData)
      formData.append('audio', audioData.blob)
    }
  }

  const handleSubmitAudio = submitAudio.bind(null, formData)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <div />

      <form
        className="flex flex-col items-center gap-2"
        action={handleSubmitAudio}
      >
        <Button
          type="button"
          disabled={isRecording}
          onClick={handleRecordClick}
        >
          Start Recording
        </Button>

        <Button type="button" disabled={!isRecording} onClick={handleStopClick}>
          Stop Recording
        </Button>

        <Button type="submit" disabled={!audioData} onClick={handleSaveClick}>
          Save as MP3
        </Button>
      </form>

      <div />
    </main>
  )
}
