import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { TavilySearch } from "@langchain/tavily";
import { createAgent } from 'langchain'
import { MemorySaver } from "@langchain/langgraph"; //保存对话记录

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const tool = new TavilySearch({
  maxResults: 3,
  topic: "general",
});

const config = {
  configurable: { thread_id: '1' },
  context: { user_id: '1' },
}

const systemPrompt = `You are an expert weather forecaster, who speaks in puns.`

const checkpointer = new MemorySaver();

const agent = createAgent({
  model:llm,
  // prompt: systemPrompt,
  tools: [tool],
  // responseFormat,
  checkpointer,
})

const response = await agent.invoke(
  { messages: [{ role: 'user', content: '详细的介绍一下你自己。' }] },
  config
)
console.log(response)