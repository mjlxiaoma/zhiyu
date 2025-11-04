import { tool } from '@langchain/core/tools'
import * as z from 'zod'
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { task, entrypoint } from '@langchain/langgraph'
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
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

/**
 * 定义 model 并绑定 tools
 */
const llm = new ChatDeepSeek({
  model: 'deepseek-chat', // 模型名称
})

// Augment the LLM with tools
const toolsByName = {
  [add.name]: add,
  [multiply.name]: multiply,
  [divide.name]: divide,
}

const tools = Object.values(toolsByName)
const modelWithTools = llm.bindTools(tools)

/**
 * 调用工具并返回 ToolMessage
 */
async function callTool(toolCall) {
  const tool = toolsByName[toolCall.name]
  if (!tool) {
    throw new Error(`Tool ${toolCall.name} not found`)
  }
  const result = await tool.invoke(toolCall.args)
  return new ToolMessage({
    content: String(result),
    tool_call_id: toolCall.id,
  })
}

/**
 * 添加消息到消息数组
 */
function addMessages(messages, newMessages) {
  return [...messages, ...newMessages]
}

/**
 * 定义 callModel task
 */
const callModel = task({ name: 'callLlm' }, async (messages) => {
  return modelWithTools.invoke([
    new SystemMessage('你是一个数学老师，请根据用户的问题给出答案'),
    ...messages,
  ])
})

/**
 * 定义 Agent
 */
const agent = entrypoint({ name: 'agent' }, async (messages) => {
  // 先调用 llm
  let modelResponse = await callModel(messages)

  // 一个无限循环
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
    messages = addMessages(messages, [modelResponse, ...toolResults])
    modelResponse = await callModel(messages)
  }
  // 返回所有消息，包括最终的模型响应
  return addMessages(messages, [modelResponse])
})

const result = await agent.invoke([new HumanMessage('Add 3 and 4.')])

for (const message of result) {
  console.log(`[${message.getType()}]: ${message.text}`)
}