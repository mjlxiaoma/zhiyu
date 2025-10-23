import { ChatDeepSeek } from '@langchain/deepseek'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import 'dotenv/config'

// 创建 DeepSeek 客户端
const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

// 定义 System Prompt，引导 AI 使用 Chain-of-Thought
const systemPrompt = `你是一名资深的前端工程师和面试官。
在回答问题时，你必须按照以下步骤进行逐步思考和分析（Chain-of-Thought）：

第一步：进行性能监控
- 如何确定网页是否真的慢？
- 使用什么工具和指标来衡量？
- 慢到什么程度才需要优化？

第二步：性能数据分析
- 分析哪些环节可能存在问题？
- 瓶颈可能在哪里？（网络、渲染、资源加载等）
- 如何定位具体的瓶颈点？

第三步：找到瓶颈并分析原因
- 针对发现的瓶颈，分析其根本原因
- 为什么会出现这个问题？
- 列出可能的解决方案

第四步：解决问题
- 给出具体的优化方案
- 说明实施步骤
- 预期的优化效果

请严格按照这四个步骤进行思考，每一步都要清晰地展示你的思考过程，最后给出完整的答案。`

// 用户问题
const question = '如果一个网页加载速度慢，该如何处理？'

// 构建消息
const messages = [
  new SystemMessage(systemPrompt),
  new HumanMessage(question),
]

console.log('=== 面试题 ===')
console.log(question)
console.log('\n=== AI 使用 Chain-of-Thought 思考并回答 ===\n')

// 调用 AI 接口
const response = await llm.invoke(messages)
console.log(response.content)

