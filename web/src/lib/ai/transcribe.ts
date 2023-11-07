import fs from 'fs'
import { Uploadable } from 'openai/uploads'
import path from 'path'

import { openai } from '@/lib/ai/client'

export async function transcribe(blob: Blob) {
  const buffer = await blob.arrayBuffer()
  const filePath = path.resolve('./src/assets/gen/request.webm')
  fs.writeFileSync(filePath, Buffer.from(buffer))

  const file = fs.createReadStream(filePath)

  const transcript = await openai.audio.transcriptions.create({
    file: file as Uploadable,
    model: 'whisper-1',
    language: 'en',
  })

  return transcript
}
