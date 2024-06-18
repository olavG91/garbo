import { assert } from 'console'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources'

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
})

const ask = async (messages: ChatCompletionMessageParam[]) => {
  const response = await openai.chat.completions.create({
    messages: messages.filter((m) => m.content),
    model: 'gpt-4o',
    temperature: 0.1,
    stream: false,
  })

  return response.choices[0].message.content
}

const askPrompt = async (prompt: string, context: string) => {
  assert(prompt, 'Prompt is required')
  assert(context, 'Context is required')
  return await ask([
    {
      role: 'system',
      content: 'You are a friendly expert. Be concise and accurate.',
    },
    { role: 'user', content: prompt },
    { role: 'assistant', content: 'Sure! Just send me the context?' },
    { role: 'user', content: context },
  ])
}

const askStream = async (
  messages: ChatCompletionMessageParam[],
  onParagraph?
) => {
  const stream = await openai.chat.completions.create({
    messages: messages.filter((m) => m.content),
    model: 'gpt-4o',
    temperature: 0.1,
    stream: true,
    response_format: {
      type: 'json_object',
    },
  })

  let response = ''
  let paragraph = ''
  for await (const part of stream) {
    const chunk = part.choices[0]?.delta?.content || ''
    response += chunk
    paragraph += chunk
    if (onParagraph && chunk.includes('\n')) {
      onParagraph(response, paragraph)
      paragraph = ''
    }
  }
  // send the rest if there is any
  if (onParagraph && paragraph) onParagraph(response, paragraph)

  return response
}

const csrd_schema = {
  "type": "object",
  "properties": {
    "titles": {
      "type": "array",
      "items": {
        "type": "string",
      },
      "description": "En lista av titlar."
    }
  },
  "required": ["titles"],
  "description": "Schema för att definiera strukturen och innehållet för titlar."
}

const askSchema = async (
  messages: ChatCompletionMessageParam[],
  onParagraph?
) => {
  const response = await openai.chat.completions.create({
    messages: messages.filter((m) => m.content),
    model: 'gpt-4o',
    temperature: 0.1,
    stream: false,
    functions: [{ name: "csrd_report", parameters: csrd_schema }],
    function_call: { name: "csrd_report" }
  })

  console.log(response.choices[0].message.function_call.arguments);
  return false;

  return response
}

export { ask, askPrompt, askStream, askSchema }
