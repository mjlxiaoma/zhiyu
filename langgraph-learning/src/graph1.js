//实现一个条件判断的工作流。
import { tool } from '@langchain/core/tools'
import * as z from 'zod'
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { MessagesZodMeta, MemorySaver } from '@langchain/langgraph'
import { registry } from '@langchain/langgraph/zod'
// import { type BaseMessage } from '@langchain/core/messages'
import { SystemMessage, isAIMessage } from '@langchain/core/messages'
import { StateGraph, START, END } from '@langchain/langgraph'

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

// 定义 MessagesState 它将用于存储 AI messages 消息列表，和 llmCalls llm 调用的次数

const MessagesState = z.object({
  messages: z.array(z.custom()).register(registry, MessagesZodMeta),
  llmCalls: z.number().optional(),
});

async function llmCall(state) {
  const newMessages = await modelWithTools.invoke([
    new SystemMessage(
      'You are a helpful assistant tasked with performing arithmetic on a set of inputs.'
    ),
    ...state.messages,
  ])
 
  const newLlmCalls = (state.llmCalls ?? 0) + 1
  return {
    messages: newMessages,
    llmCalls: newLlmCalls,
  }
}

/**
 * 
 * @param {*} state 
 * @returns 
 * 在如下代码中，我们要判断当前 message 是否有 tool_call 信息 lastMessage.tool_calls
  如果有，则调用 tool 函数并存储结果。如果没有则返回空的
 */
async function toolNode(state) {
  const lastMessage = state.messages.at(-1)

  if (lastMessage == null || !isAIMessage(lastMessage)) {
    return { messages: [] }
  }

  const result = []
  for (const toolCall of lastMessage.tool_calls ?? []) {
    const tool = toolsByName[toolCall.name]
    const observation = await tool.invoke(toolCall)
    result.push(observation)
  }

  return { messages: result }
}

// 定义条件判断
async function shouldContinue(state) {
  const lastMessage = state.messages.at(-1)
  if(lastMessage == null || !isAIMessage(lastMessage)) {
    return END
  }
  if(lastMessage.tool_calls.length) {
   return 'toolNode'
  }
   // Otherwise, we stop (reply to the user)
   return END
}
/**
 *  代表的就是一个流程图
    addNode 定义一个节点
    addEdge 定义一个边或者连线
    START 就是流程开始
    END 就是流程结束
    所以这段代码表示的就是这样一个流程图：
    START --> callModel --> END
 */

// 创建 Memory 保存器，用于保存对话历史
const checkpointer = new MemorySaver()

// 定义 workflow
const graph = new StateGraph(MessagesState)
  .addNode('llmCall', llmCall)  //定义一个节点
  .addNode('toolNode', toolNode) //定义另一个节点
  .addEdge(START, 'llmCall')  //开始流程
  .addConditionalEdges('llmCall', shouldContinue, ['toolNode', END]) //结束流程
  .addEdge('toolNode', 'llmCall') //连接两个节点

// 编译图为可执行的应用，传入 checkpointer 启用记忆功能
const app = graph.compile({ checkpointer })

// 配置：每个对话需要一个唯一的 thread_id，相同 thread_id 共享对话历史
const config = {
  configurable: { 
    thread_id: 'conversation-1'  // 对话线程 ID
  }
}

console.log('\n🤖 ===== 第一轮对话 =====')
// 第一轮：执行计算任务
const result1 = await app.invoke({
  messages: [{ role: 'user', content: '帮我计算 (3 + 5) × 2 的结果' }],
  llmCalls: 0,
}, config)

// console.log('用户:', '帮我计算 (3 + 5) × 2 的结果')
// console.log('AI:', result1.messages[result1.messages.length - 1].content)
// console.log('LLM 调用次数:', result1.llmCalls)

// console.log('\n\n🤖 ===== 第二轮对话（测试记忆功能）=====')
// 第二轮：询问之前的计算结果（测试记忆）
const result2 = await app.invoke({
  messages: [{ role: 'user', content: '刚才的结果是多少？' }],
}, config)

// console.log('用户:', '刚才的结果是多少？')
// console.log('AI:', result2.messages[result2.messages.length - 1].content)
// console.log('总 LLM 调用次数:', result2.llmCalls)

// console.log('\n\n🤖 ===== 第三轮对话（继续使用历史信息）=====')
// 第三轮：基于之前的结果继续计算
const result3 = await app.invoke({
  messages: [{ role: 'user', content: '把这个结果除以 4' }],
}, config)

console.log('用户:', '把这个结果除以 4')
console.log('AI:', result3.messages[result3.messages.length - 1].content)
console.log('总 LLM 调用次数:', result3.llmCalls)

console.log('\n\n📊 ===== 完整对话历史 =====')
console.log('总消息数:', result3.messages.length)
result3.messages.forEach((msg, index) => {
  console.log(`\n[${index + 1}] ${msg._getType()}:`)
  if (msg.content) {
    console.log('内容:', typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content))
  }
})