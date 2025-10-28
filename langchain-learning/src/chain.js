import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import 'dotenv/config'

import { RunnableLambda } from '@langchain/core/runnables'

/**
 * LangChain 这个名字取的很好，lang 是 language 语言，chain 就是链。如何体现”链"呢？

  在一个链上，有多个节点，这些节点通过 pipe 函数前后连接起来，数据在这个链上流转。

  const chian = a.pipe(b).pipe(c).pipe(d)
  chian.invoke('xxx')
 */
const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const prompt = ChatPromptTemplate.fromTemplate('讲一个关于{topic}的笑话')

const chain = prompt.pipe(llm).pipe(new StringOutputParser())
// const res = await chain.invoke({ topic: '狗熊' })
// console.log(res)
// const stream  = await chain.stream({ topic: '狗熊' })
// for await (const chunk of stream) {
//   console.log(`${chunk}|`)
// }


const analysisPrompt =
  ChatPromptTemplate.fromTemplate('这个笑话搞笑吗？ {joke}')

const composedChain = new RunnableLambda({
  func: async (input) => {
    const result = await chain.invoke(input)
    return { joke: result }
  },
})
  .pipe(analysisPrompt)
  .pipe(llm)
  .pipe(new StringOutputParser())

const res2 = await composedChain.invoke({ topic: '狗熊' })
console.log(res2)
