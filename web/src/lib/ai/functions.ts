import { AssistantCreateParams } from 'openai/resources/beta/assistants/assistants.mjs'

export const availableFunctions = [get_stock_price]

export async function get_stock_price({ symbol }: { symbol: string }) {
  const res = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=JUHDXYMD5N13J8RG`
  )

  const json = await res.json()
  const price = json['Global Quote']['05. price']

  return { price: Number(price) }
}

const functions: AssistantCreateParams.AssistantToolsFunction.Function[] = [
  {
    name: 'get_stock_price',
    description: 'Get the current stock price',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'The stock symbol',
        },
      },
      required: ['symbol'],
    },
  },
  {},
]
