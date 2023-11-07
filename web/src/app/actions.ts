'use server'

import fs from 'fs'
import OpenAI from 'openai'
import { Uploadable } from 'openai/uploads'
import path from 'path'

export async function submitAudio(formData: FormData) {
  const blob = formData.get('audio') as Blob
  const transcript = await transcribe(blob)
  console.log(transcript)

  return transcript
}

async function transcribe(blob: Blob) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const buffer = await blob.arrayBuffer()
  const filePath = path.resolve('./src/assets/recording.webm')
  fs.writeFileSync(filePath, Buffer.from(buffer))

  const file = fs.createReadStream(filePath)

  const transcript = await openai.audio.transcriptions.create({
    file: file as Uploadable,
    model: 'whisper-1',
    language: 'en',
  })

  return transcript
}
