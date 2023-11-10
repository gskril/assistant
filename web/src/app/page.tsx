'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'

import { ActionResponse, submitAudio } from '@/app/actions'

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

  // add the audio to the form data when it's available
  useEffect(() => {
    if (audioData) {
      formData.append('audio', audioData.blob)
    }
  }, [audioData])

  const [isFormPending, setIsFormPending] = useState(false)
  const [formState, handleSubmitAudio] = useFormState(submitAudio, initialState)

  useEffect(() => {
    console.log(formState)

    if (formState.response.filePath && !isFormPending) {
      // load the audio file and play it at 1.5x speed
      const audio = new Audio(formState.response.filePath)
      audio.playbackRate = 1.35
      audio.play()
    }
  }, [isFormPending])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gray-950 p-6 text-gray-50">
      <div />

      <form
        className="flex flex-col items-center gap-2"
        action={() => handleSubmitAudio(formData)}
        ref={formRef}
      >
        <div
          data-state={
            isFormPending ? 'pending' : isRecording ? 'recording' : 'idle'
          }
          className={clsx([
            'relative h-16 w-16 rounded-full border-4 border-gray-50 p-1',
            'after:pointer-events-none after:absolute after:left-[50%] after:top-[50%] after:block after:h-12 after:w-12 after:translate-x-[-50%] after:translate-y-[-50%] after:rounded-[2rem] after:bg-red-500 after:transition-all after:duration-200 after:ease-in-out after:content-[""]',
            'after:data-[state=pending]:scale-[60%] after:data-[state=recording]:scale-[60%] after:data-[state=pending]:animate-pulse after:data-[state=pending]:rounded-xl after:data-[state=recording]:rounded-xl after:data-[state=pending]:bg-red-900',
          ])}
        >
          <button
            type="button"
            disabled={isRecording}
            aria-disabled={isRecording}
            onClick={handleRecordClick}
            className={
              isRecording || isFormPending ? 'hidden' : 'h-full w-full'
            }
          />

          <SubmitButton
            isRecording={isRecording}
            setIsPending={setIsFormPending}
            handleStopClick={handleStopClick}
            className={
              !isRecording || isFormPending ? 'hidden' : 'h-full w-full'
            }
          />
        </div>
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
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isRecording: boolean
  setIsPending: (isPending: boolean) => void
  handleStopClick: () => void
}) {
  const { pending } = useFormStatus()

  // hoist the pending state up to the parent
  useEffect(() => setIsPending(pending), [pending])

  return (
    <button
      type="button"
      disabled={!isRecording || pending}
      aria-disabled={!isRecording || pending}
      onClick={handleStopClick}
      {...props}
    />
  )
}
