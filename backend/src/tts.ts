import Bun from 'bun'
import OpenAI from 'openai'
import path from 'path'

const openai = new OpenAI()

const speechFile = path.resolve('./speech.mp3')

async function main() {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'nova',
    input: 'Today is a wonderful day to build something people love!',
  })
  console.log(speechFile)
  const buffer = Buffer.from(await mp3.arrayBuffer())
  await Bun.write(speechFile, buffer)
}
main()
