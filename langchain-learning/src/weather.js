import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { TavilySearch } from "@langchain/tavily";

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

// 绑定工具到 LLM
const llmWithTools = llm.bindTools([tool])

// 执行网络搜索查询
const question = "近期北京天气怎么样？"
console.log(`问题: ${question}\n`)

const response = await llmWithTools.invoke(question)

console.log('模型响应:')
console.log(response)

// 如果模型决定使用工具，执行工具调用
if (response.tool_calls && response.tool_calls.length > 0) {
  console.log('\n检测到工具调用，正在执行搜索...\n')
  
  for (const toolCall of response.tool_calls) {
    console.log(`工具名称: ${toolCall.name}`)
    console.log(`搜索参数:`, toolCall.args)
    
    // 执行实际的搜索
    const searchResults = await tool.invoke(toolCall.args)
    console.log('\n搜索结果:')
    console.log(searchResults)
  }
}