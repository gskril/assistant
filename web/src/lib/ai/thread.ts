import { openai } from './client'
import { availableFunctions, get_stock_price } from './functions'

const { threads } = openai.beta
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
    await new Promise((resolve) => setTimeout(resolve, 1000))
    run = await threads.runs.retrieve(threadId, run.id)
    console.log('response to message:', run.status)
  }

  const response = await threads.runs.retrieve(threadId, run.id)

  if (response.required_action) {
    // TODO: figure out why this always returns one action even if there are multiple
    const actions = response.required_action.submit_tool_outputs.tool_calls

    const answers: {
      actionId: string
      data: any
    }[] = []

    for (const action of actions) {
      // check if the action.function.name is in availableFunctions
      const relevantFunction = availableFunctions.find(
        (fn) => fn.name === action.function.name
      )

      if (relevantFunction) {
        const answer = await relevantFunction(
          JSON.parse(action.function.arguments)
        )

        answers.push({
          actionId: action.id,
          data: answer,
        })
      }
    }

    // Submit the function outputs
    await threads.runs.submitToolOutputs(threadId, run.id, {
      tool_outputs: answers.map((answer) => {
        return {
          tool_call_id: answer.actionId,
          output: JSON.stringify(answer.data),
        }
      }),
    })

    // Wait for a response to be generated using the function outputs
    run = await threads.runs.retrieve(threadId, run.id)
    while (pendingStatuses.includes(run.status)) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      run = await threads.runs.retrieve(threadId, run.id)
      console.log('response to function call:', run.status)
    }
  }

  const messages = await threads.messages.list(threadId)

  // find the most recent message from the AI
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
