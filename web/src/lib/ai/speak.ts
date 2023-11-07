import fs from 'fs'
import path from 'path'

import { openai } from '@/lib/ai/client'

export async function speak(text: string) {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'nova',
    input: text,
  })

  const filePath = path.resolve('./src/assets/gen/response.mp3')
  const buffer = Buffer.from(await mp3.arrayBuffer())
  fs.writeFileSync(filePath, buffer)

  return filePath
}
