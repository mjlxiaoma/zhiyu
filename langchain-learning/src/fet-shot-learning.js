import { PromptTemplate } from '@langchain/core/prompts'
import { FewShotPromptTemplate } from '@langchain/core/prompts'
import { ChatDeepSeek } from '@langchain/deepseek'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import 'dotenv/config'

// 定义示例数据
const examples = [
  {
    question: `
      给以下 JS 函数写注释
      function add(a, b) {{
        return a + b;
      }}`,
    answer: `
      /**
      * 两个数字相加求和
      * @param {{number}} a - 第一个数字
      * @param {{number}} b - 第二个数字
      * @returns {{number}} 两个数字的和
      */`,
  },
  {
    question: `
      给以下 JS 函数写注释
      function getUser(id) {{
        return db.findUserById(id);
      }}
    `,
    answer: `
      /**
      * 根据用户ID从数据库中获取用户信息
      * @param {{string}} id - 唯一的用户 id
      * @returns {{Object|null}} 返回用户对象，如果未找到则返回 null
      */`,
  },
]

// 定义示例的格式模板
const examplePrompt = new PromptTemplate({
  inputVariables: ['question', 'answer'],
  template: 'Question: {question}\nAnswer: {answer}',
})

// 创建 FewShotPromptTemplate
const prompt = new FewShotPromptTemplate({
  examples: examples,
  examplePrompt: examplePrompt,
  suffix: 'Question: {input}',
  inputVariables: ['input'],
})

// 格式化输出
const formatted = await prompt.format({
  input: `
  给以下 JS 函数写注释
  function formatDate(date) {{
    return date.toISOString().split('T')[0];
  }}`,
})
console.log('=== 格式化的提示词 ===')
console.log(formatted)
console.log('\n=== AI 响应 ===')

// 创建 DeepSeek 客户端
const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

// 构建消息
const messages = [
  new SystemMessage(`你是一名资深的 Node.js 工程师，请为给定的函数写英文文档注释。
格式要求：
1. 使用 JSDoc 风格。
2. 每个参数必须有描述。
3. 结尾要有返回值说明。`),
  new HumanMessage(formatted),
]

// 调用 AI 接口
const response = await llm.invoke(messages)
console.log(response.content)