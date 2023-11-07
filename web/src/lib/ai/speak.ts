import fs from 'fs'
import { revalidatePath } from 'next/cache'
import path from 'path'

import { openai } from '@/lib/ai/client'

export async function speak(text: string, id: number) {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'nova',
    input: text,
  })

  const publicPath = `/gen/response-${id}.mp3`
  const filePath = path.resolve(`./public${publicPath}`)
  const buffer = Buffer.from(await mp3.arrayBuffer())
  fs.writeFileSync(filePath, buffer)

  revalidatePath(publicPath)

  return publicPath
}
