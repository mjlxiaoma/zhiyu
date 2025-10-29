import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const res1 = await llm.invoke([{ role: 'user', content: '你好，我是小马' }])
console.log('res1 ', res1)
const res2 = await llm.invoke([{ role: 'user', content: '我是谁？' }])
console.log('res2 ', res2)
const res3 = await llm.invoke([
  { role: 'user', content: '你好，我是小马' },
  // { role: 'assistant', content: '你好，小马！今天我能帮你什么？' },
  { role: 'user', content: '我叫什么名字' },
])
console.log('res3 ', res3)