import { ChatDeepSeek } from '@langchain/deepseek'
import { TavilySearch } from "@langchain/tavily";
import 'dotenv/config'
import { createAgent, tool } from 'langchain'
import * as z from 'zod'

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
// const getWeather = tool((input) => `It's always sunny in ${input.city}!`, {
//   name: 'get_weather',
//   description: 'Get the weather for a given city',
//   schema: z.object({
//     city: z.string().describe('The city to get the weather for'),
//   }),
// })

const agent = createAgent({
  model: llm,
  tools: [tavilySearchTool],
})

const res = await agent.invoke({
  messages: [{ role: 'user', content: "全球最大的城市是哪个？" }],
})

console.log(res)
