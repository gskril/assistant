'use server'

import * as ai from '@/lib/ai'

export type ActionResponse = {
  transcript: string
  response: {
    text: string
    filePath: string
  }
}

export async function submitAudio(
  prevDate: any,
  formData: FormData
): Promise<ActionResponse> {
  console.log('action triggered')
  const blob = formData.get('audio') as Blob
  console.log(blob)

  const transcript = await ai.transcribe(blob)

  const reply = 'This is a test message from OpenAI text to speech API.'
  const mp3 = await ai.speak(reply)

  return {
    transcript: transcript.text,
    response: {
      text: reply,
      filePath: mp3,
    },
  }
}
