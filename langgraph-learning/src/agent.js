import { ChatDeepSeek } from '@langchain/deepseek'
import { TavilySearch } from "@langchain/tavily";
import 'dotenv/config'
import { createAgent, tool } from 'langchain'
import * as z from 'zod'
import { MemorySaver } from "@langchain/langgraph"; //保存对话记录

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const tavilySearchTool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});
// const llmWithTools = llm.bindTools([tool])
// const question = "全球最大的城市是哪个？"
// const response = await llmWithTools.invoke(question)
// console.log(response);

// define a tool
const getWeather = tool((input) => `It's always sunny in ${input.city}!`, {
  name: 'get_weather_for_location',
  description: 'Get the weather for a given city',
  schema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
})

// const agent = createAgent({
//   model: llm,
//   tools: [tavilySearchTool],
// })

// const res = await agent.invoke({
//   messages: [{ role: 'user', content: "全球最大的城市是哪个？" }],
// })

// console.log(res)


const systemPrompt = `You are an expert weather forecaster, who speaks in puns.`
const getUserLocation = tool(
  (_, config) => {
    const { user_id } = config.context
    return user_id === '1' ? 'Florida' : 'SF'
  },
  {
    name: 'get_user_location',
    description: 'Retrieve user information based on user ID',
  }
)
const responseFormat = z.object({
  punny_response: z.string(),
  weather_conditions: z.string().optional(),
})
const checkpointer = new MemorySaver();

const config = {
  configurable: { thread_id: '1' }, // Memory 需要一个 thread_id ，每个对话一个 id ，防止混乱
  context: { user_id: '1' },
}

const agent = createAgent({
  model:llm,
  prompt: systemPrompt,
  tools: [getWeather, getUserLocation],
  // responseFormat,
  checkpointer,
})

const response = await agent.invoke(
  { messages: [{ role: 'user', content: 'what is the weather outside?' }] },
  config
)
console.log(response.structuredResponse)

const thankYouResponse = await agent.invoke(
  { messages: [{ role: 'user', content: 'thank you!' }] },
  config
)
console.log('\nSecond response:')
console.log(
  thankYouResponse.messages[thankYouResponse.messages.length - 1].content
)
