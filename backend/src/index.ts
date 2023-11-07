import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: Bun.env.OPENAI_API_KEY })
const { assistants, threads } = openai.beta

// Greg's Assistant
const assistant = await assistants.retrieve('asst_LsNvu8muCe9S7VfmZsJcW9y5')
const thread = await threads.retrieve('thread_BYGDCKWRQiJhgACL7R5ZDH8i')

await threads.messages.create(thread.id, {
  role: 'user',
  content: "What's the weather in london?",
})

let run = await threads.runs.create(thread.id, {
  assistant_id: assistant.id,
})

const pendingStatuses = ['in_progress', 'queued']
while (pendingStatuses.includes(run.status)) {
  console.log(run.status)
  await new Promise((resolve) => setTimeout(resolve, 1000))
  run = await threads.runs.retrieve(thread.id, run.id)
}

const response = await threads.runs.retrieve(thread.id, run.id)

if (response.required_action) {
  // TODO: figure out how to handle multiple actions
  const actions = response.required_action.submit_tool_outputs.tool_calls

  await threads.runs.submitToolOutputs(thread.id, run.id, {
    tool_outputs: [
      {
        tool_call_id: actions[0].id,
        output: JSON.stringify({
          temp: 68,
        }),
      },
    ],
  })
}

console.log(response)
