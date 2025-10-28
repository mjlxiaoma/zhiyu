import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { RunnableMap } from '@langchain/core/runnables'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

const historyChain = PromptTemplate.fromTemplate('介绍一下{city}的历史文化')
  .pipe(llm)
  .pipe(new StringOutputParser())


  const mapChain = RunnableMap.from({
    history: historyChain
  })
  
  const result = await mapChain.invoke({ city: '北京' })
  console.log(result)