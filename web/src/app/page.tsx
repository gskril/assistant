'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'

import { ActionResponse, submitAudio } from '@/app/actions'
import { Button } from '@/components/ui/button'

type AudioData = {
  url: string
  blob: Blob
}

const initialState: ActionResponse = {
  transcript: '',
  response: {
    text: '',
    filePath: '',
  },
}

export default function Home() {
  const formData = new FormData()
  const formRef = useRef<HTMLFormElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [audioData, setAudioData] = useState<AudioData | null>(null)

  const handleRecordClick = async () => {
    formData.append('test', 'hi')

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
      setIsFormPending(true)

      // wait 100ms until the audio data is set
      await new Promise((resolve) => setTimeout(resolve, 100))

      // submit the form
      if (formRef.current) {
        formRef.current.requestSubmit()
      }
    }
  }

  useEffect(() => {
    if (audioData) {
      formData.append('audio', audioData.blob)
    }
  }, [audioData])

  const [isFormPending, setIsFormPending] = useState(false)
  const [state, handleSubmitAudio] = useFormState(submitAudio, initialState)

  console.log(isFormPending, state)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <div />

      <form
        className="flex flex-col items-center gap-2"
        action={() => handleSubmitAudio(formData)}
        ref={formRef}
      >
        <p className={isFormPending ? 'block' : 'hidden'}>Loading</p>

        <Button
          type="button"
          disabled={isRecording}
          onClick={handleRecordClick}
          className={isRecording || isFormPending ? 'hidden' : ''}
        >
          Start Recording
        </Button>

        <SubmitButton
          isRecording={isRecording}
          setIsPending={setIsFormPending}
          handleStopClick={handleStopClick}
          className={!isRecording || isFormPending ? 'hidden' : ''}
        />
      </form>
      <div />
    </main>
  )
}

function SubmitButton({
  isRecording,
  setIsPending,
  handleStopClick,
  ...props
}: React.ComponentProps<typeof Button> & {
  isRecording: boolean
  setIsPending: (isPending: boolean) => void
  handleStopClick: () => void
}) {
  const { pending } = useFormStatus()

  // hoist the pending state up to the parent
  useEffect(() => setIsPending(pending), [pending])

  return (
    <Button
      type="button"
      disabled={!isRecording}
      aria-disabled={pending}
      onClick={handleStopClick}
      {...props}
    >
      Stop Recording
    </Button>
  )
}
