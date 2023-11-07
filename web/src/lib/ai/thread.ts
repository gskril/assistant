import { openai } from './client'

const { assistants, threads } = openai.beta

const assistantId = 'asst_LsNvu8muCe9S7VfmZsJcW9y5'
const threadId = 'thread_BYGDCKWRQiJhgACL7R5ZDH8i'

export async function addUserThreadItem(message: string) {
  await threads.messages.create(threadId, {
    role: 'user',
    content: message,
  })

  let run = await threads.runs.create(threadId, {
    assistant_id: assistantId,
  })

  const pendingStatuses = ['in_progress', 'queued']
  while (pendingStatuses.includes(run.status)) {
    console.log(run.status)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    run = await threads.runs.retrieve(threadId, run.id)
  }

  const response = await threads.runs.retrieve(threadId, run.id)

  if (response.required_action) {
    return 'Some action is required'

    // // TODO: figure out how to handle multiple actions
    // const actions = response.required_action.submit_tool_outputs.tool_calls

    // await threads.runs.submitToolOutputs(threadId, run.id, {
    //   tool_outputs: [
    //     {
    //       tool_call_id: actions[0].id,
    //       output: JSON.stringify({
    //         temp: 68,
    //       }),
    //     },
    //   ],
    // })
  }

  const messages = await threads.messages.list(threadId)

  // find the first message that is from the AI
  const latestRelevantMessage = messages.data.find(
    (message) => message.role === 'assistant'
  )

  // seems like the openai sdk is not typed correctly, so lets cast it
  const latestRelevantMessageContent = latestRelevantMessage?.content[0] as {
    type: 'image_file' | 'text' | undefined
    text: {
      value: string
      annotations: any[]
    }
  }

  return latestRelevantMessageContent?.text.value
}
