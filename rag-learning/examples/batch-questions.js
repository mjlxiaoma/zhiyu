import { NikeRagAgent } from '../src/nike-rag-agent.js'

const agent = new NikeRagAgent()

async function batchExample() {
  console.log('='.repeat(70))
  console.log('批量问题示例')
  console.log('='.repeat(70))

  const questions = [
    "What was Nike's revenue in 2023?",
    "What was Nike's net income in 2023?",
    "How much did NIKE Direct grow in fiscal 2023?",
    "What are Nike's main product categories?",
  ]

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    console.log(`\n--- 问题 ${i + 1}/${questions.length} ---`)
    console.log(`❓ ${question}`)

    const result = await agent.ask(question)

    if (result.success) {
      console.log('✅ 回答:', result.answer.substring(0, 100) + '...')
    } else {
      console.log('❌ 错误:', result.error)
    }

    console.log('---')

    // 避免请求过快
    if (i < questions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

batchExample().catch(console.error)
