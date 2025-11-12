import { NikeRagAgent } from '../src/nike-rag-agent.js'

// 创建 RAG Agent 实例
const agent = new NikeRagAgent()

async function basicExample() {
  console.log('='.repeat(70))
  console.log('基本使用示例')
  console.log('='.repeat(70))
  
  // 单个问题
  const question = "What was Nike's revenue in 2023?"
  const result = await agent.ask(question)
  
  if (result.success) {
    console.log('\n✅ 成功!')
    console.log('问题:', result.question)
    console.log('答案:', result.answer)
    console.log('文档数:', result.documents.length)
  } else {
    console.log('❌ 失败:', result.error)
  }
}

basicExample().catch(console.error)
