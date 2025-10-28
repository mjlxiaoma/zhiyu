import { ChatDeepSeek } from '@langchain/deepseek'
import { z } from 'zod'
import 'dotenv/config'

// 使用 zod 定义情感分析的输出结构
const SentimentAnalysis = z.object({
  sentiment: z
    .enum(['positive', 'negative', 'neutral'])
    .describe('情感类型：positive(褒义)、negative(贬义)、neutral(中性)'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('置信度，0-1 之间的数值'),
  reason: z.string().describe('判断理由'),
})

// 创建 DeepSeek 客户端
const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
  temperature: 0, // 降低温度使输出更确定
})

// 使用 withStructuredOutput 绑定输出结构
const llmWithStructuredOutput = llm.withStructuredOutput(SentimentAnalysis)

// 测试句子
const testSentences = [
  '这家餐厅的菜品真是太好吃了，服务也特别周到！',
  '这部电影简直是浪费时间，剧情拖沓，演技尴尬。',
  '今天的天气是晴天。',
  '他是一个非常优秀的工程师，解决问题的能力很强。',
  '这个产品质量太差了，用了一天就坏了。',
]

console.log('=== 情感分析测试 ===\n')

// 逐个分析句子
for (const sentence of testSentences) {
  console.log(`输入: ${sentence}`)
  
  const result = await llmWithStructuredOutput.invoke(
    `请分析以下句子的情感倾向：\n\n"${sentence}"\n\n请判断这句话是褒义(positive)、贬义(negative)还是中性(neutral)，并给出判断理由。`
  )
  
  const sentimentMap = {
    positive: '褒义 ✓',
    negative: '贬义 ✗',
    neutral: '中性 ○',
  }
  
  console.log(`输出: ${sentimentMap[result.sentiment]}`)
  console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`)
  console.log(`理由: ${result.reason}`)
  console.log('---\n')
}
