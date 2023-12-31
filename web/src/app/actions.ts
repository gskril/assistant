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
  const id = new Date().getTime()
  const blob = formData.get('audio') as Blob
  const transcript = await ai.transcribe(blob)
  const aiResponse = await ai.addUserThreadItem(transcript.text)
  const mp3 = await ai.speak(aiResponse, id)

  return {
    transcript: transcript.text,
    response: {
      text: aiResponse,
      filePath: mp3,
    },
  }
}
