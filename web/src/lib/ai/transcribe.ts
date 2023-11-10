import fs from 'fs'

import { openai } from '@/lib/ai/client'

export async function transcribe(blob: Blob) {
  const buffer = await blob.arrayBuffer()
  const filePath = '/tmp/request.webm'
  fs.writeFileSync(filePath, Buffer.from(buffer))

  const transcript = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
    language: 'en',
  })

  return transcript
}
