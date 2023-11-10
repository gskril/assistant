import fs from 'fs'
import { revalidatePath } from 'next/cache'
import path from 'path'

import { openai } from '@/lib/ai/client'

export async function speak(text: string, id: number) {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
  })

  const buffer = Buffer.from(await mp3.arrayBuffer())
  const base64 = buffer.toString('base64')

  return 'data:video/webm;base64,' + base64
}
