//实现一个条件判断的工作流。
import { tool } from '@langchain/core/tools'
import * as z from 'zod'
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import {
  MessagesZodMeta,
  MemorySaver,
  getPreviousState,
} from '@langchain/langgraph'
import { task, entrypoint } from '@langchain/langgraph'
import { registry } from '@langchain/langgraph/zod'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

// Define tools
const add = tool(({ a, b }) => a + b, {
  name: 'add',
  description: 'Add two numbers',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
})

const multiply = tool(({ a, b }) => a * b, {
  name: 'multiply',
  description: 'Multiply two numbers',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
})

const divide = tool(({ a, b }) => a / b, {
  name: 'divide',
  description: 'Divide two numbers',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
})

// Augment the LLM with tools
const toolsByName = {
  [add.name]: add,
  [multiply.name]: multiply,
  [divide.name]: divide,
}
const tools = Object.values(toolsByName)

const modelWithTools = llm.bindTools(tools)

// 定义 MessagesState
const MessagesState = z.object({
  messages: z.array(z.custom()).register(registry, MessagesZodMeta),
  llmCalls: z.number().optional(),
})

const callModel = task({ name: 'callLlm' }, async (messages) => {
  return modelWithTools.invoke([
    new SystemMessage('你是一个数学老师，请根据用户的问题给出答案'),
    ...messages,
  ])
})

// 调用工具函数
async function callTool(toolCall) {
  const tool = toolsByName[toolCall.name]
  return await tool.invoke(toolCall)
}

// 创建 Memory 保存器，用于保存对话历史
const checkpointer = new MemorySaver()
/**
 * 定义 Agent
 */
const agent = entrypoint({ name: 'agent', checkpointer }, async (messages) => {
  const previousState = getPreviousState(MessagesState) ?? {
    messages: [],
    llmCalls: 0,
  }
  let totalLlmCalls = previousState.llmCalls ?? 0
  let currentMessages = messages
  
  // 先调用 llm
  let modelResponse = await callModel(currentMessages)
  totalLlmCalls++

  while (true) {
    // 看是否需要 tool call
    if (!modelResponse.tool_calls?.length) {
      // 不需要则退出循环
      break
    }
    // 执行 tool
    const toolResults = await Promise.all(
      modelResponse.tool_calls.map((toolCall) => callTool(toolCall))
    )
    // 将 tool 执行结果再调用 llm
    currentMessages = [...currentMessages, modelResponse, ...toolResults]
    modelResponse = await callModel(currentMessages)
    totalLlmCalls++
  }
  // 返回所有消息，包括最终的模型响应
  return [...currentMessages, modelResponse]
})

// 配置：每个对话需要一个唯一的 thread_id，相同 thread_id 共享对话历史
const config = {
  configurable: {
    thread_id: 'conversation-1', // 对话线程 ID
  },
}

console.log('\n🤖 ===== 第一轮对话 =====')
const result = await agent.invoke(
  [new HumanMessage('帮我计算 (3 + 5) × 2 的结果')],
  config
)
console.log('用户:', '帮我计算 (3 + 5) × 2 的结果')
for (const message of result) {
  if (message.content) {
    console.log(`[${message._getType()}]:`, message.content)
  }
}

console.log('\n🤖 ===== 第二轮对话（测试记忆功能）=====')
const result2 = await agent.invoke(
  [new HumanMessage('刚才的结果是多少？')],
  config
)
console.log('用户:', '刚才的结果是多少？')
for (const message of result2) {
  if (message.content) {
    console.log(`[${message._getType()}]:`, message.content)
  }
}

console.log('\n🤖 ===== 第三轮对话（继续使用历史信息）=====')
const result3 = await agent.invoke(
  [new HumanMessage('把这个结果除以 4')],
  config
)
console.log('用户:', '把这个结果除以 4')
for (const message of result3) {
  if (message.content) {
    console.log(`[${message._getType()}]:`, message.content)
  }
}
