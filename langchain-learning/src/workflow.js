import { ChatDeepSeek } from "@langchain/deepseek";
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";
import { trimMessages } from "@langchain/core/messages";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from '@langchain/langgraph'

const llm = new ChatDeepSeek({
  model: "deepseek-chat",
});

// 配置 trimMessages - 保留最后 10 条消息
const trimmer = trimMessages({
  maxTokens: 10,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

const callModel = async (state) => {
  console.log('原始消息数量: ', state.messages.length)
  
  // 使用 trimMessages 裁剪到最后 10 条
  const trimmedMessages = await trimmer.invoke(state.messages)
  console.log('裁剪后消息数量: ', trimmedMessages.length)
  
  const response = await llm.invoke(trimmedMessages)
  return { messages: [response] }
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('model', callModel)
  .addEdge(START, 'model')
  .addEdge('model', END)


const memory = new MemorySaver()
const app = workflow.compile({ checkpointer: memory })

const config = { configurable: { thread_id: uuidv4() } };
const input1 = [
  {
    role: 'user',
    content: '你好，我是小马',
  },
]
const output1 = await app.invoke({ messages: input1 }, config)
console.log('output1 ', output1.messages[output1.messages.length - 1])

const input2 = [
  {
    role: 'user',
    content: '我叫什么名字',
  },
]
const output2 = await app.invoke({ messages: input2 }, config)

console.log('output2 ', output2.messages[output2.messages.length - 1])

// 继续对话，测试消息裁剪功能
const input3 = [
  {
    role: 'user',
    content: '我今年25岁',
  },
]
const output3 = await app.invoke({ messages: input3 }, config)
console.log('\noutput3 ', output3.messages[output3.messages.length - 1])

// 再次询问，确认记忆功能正常（在裁剪范围内）
const input4 = [
  {
    role: 'user',
    content: '我多大了？',
  },
]
const output4 = await app.invoke({ messages: input4 }, config)
console.log('\noutput4 ', output4.messages[output4.messages.length - 1])

// 添加第5轮对话
const input5 = [
  {
    role: 'user',
    content: '我喜欢打篮球',
  },
]
const output5 = await app.invoke({ messages: input5 }, config)
console.log('\noutput5 ', output5.messages[output5.messages.length - 1])

// 添加第6轮对话
const input6 = [
  {
    role: 'user',
    content: '我住在北京',
  },
]
const output6 = await app.invoke({ messages: input6 }, config)
console.log('\noutput6 ', output6.messages[output6.messages.length - 1])

// 添加第7轮对话（此时已经超过10条消息）
const input7 = [
  {
    role: 'user',
    content: '我在一家科技公司工作',
  },
]
const output7 = await app.invoke({ messages: input7 }, config)
console.log('\noutput7 ', output7.messages[output7.messages.length - 1])

// 测试：询问最早的信息（应该被裁剪掉了）
const input8 = [
  {
    role: 'user',
    content: '我叫什么名字？',
  },
]
const output8 = await app.invoke({ messages: input8 }, config)
console.log('\noutput8 ', output8.messages[output8.messages.length - 1])

// 打印总消息数量
console.log('\n='.repeat(50))
console.log('总消息数量（内存中存储所有）:', output8.messages.length)
console.log('使用 trimMessages 在调用 LLM 时只传递最后 10 条消息')
console.log('内存中保留全部历史，但 AI 只能"看到"最近 10 条对话')