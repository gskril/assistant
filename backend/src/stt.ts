import Bun from 'bun'
import OpenAI from 'openai'
import { Uploadable } from 'openai/uploads'
import path from 'path'

const openai = new OpenAI()

const audioFile = path.resolve('./speech.mp3')
const bunFile = Bun.file(audioFile)

const transcript = await openai.audio.transcriptions.create({
  file: bunFile as Uploadable,
  model: 'whisper-1',
  language: 'en',
})

console.log(transcript)
