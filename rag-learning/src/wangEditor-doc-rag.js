import { ChatDeepSeek } from '@langchain/deepseek'
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { StateGraph, END } from '@langchain/langgraph'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import 'dotenv/config'

// 初始化模型和向量数据库
const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const embeddings = new AlibabaTongyiEmbeddings({
  apiKey: process.env.ALIBABA_API_KEY,
})

// 连接到 ChromaDB
const vectorStore = await Chroma.fromExistingCollection(embeddings, {
  collectionName: 'wangEditor-doc',
  url: 'http://localhost:8000',
})

async function answerQuestion(question) {
  console.log(`🔎 提问: ${question}`)

  // 检索相关文档
  const retrievedDocs = await vectorStore.similaritySearch(question, 4)
  if (retrievedDocs.length === 0) {
    console.log('⚠️ 未检索到相关内容')
    return
  }

  console.log(`📚 检索到 ${retrievedDocs.length} 条相关文档`)
  retrievedDocs.forEach((doc, index) => {
    console.log(`\n--- 文档片段 ${index + 1} ---`)
    console.log(doc.pageContent.slice(0, 300) + (doc.pageContent.length > 300 ? '...' : ''))
  })

  const contextText = retrievedDocs
    .map(
      (doc, idx) =>
        `【片段 ${idx + 1}】\n${doc.pageContent}\n来源: chunk_${doc.metadata?.chunk_index ?? '未知'}`
    )
    .join('\n\n')

  const messages = [
    new SystemMessage(
      '你是一名熟悉 wangEditor 的前端开发助手，你需要基于提供的知识片段回答用户问题。如遇缺失信息要如实说明。回答需使用简体中文。'
    ),
    new HumanMessage(
      `以下是与问题相关的知识片段：\n${contextText}\n\n请回答用户的问题：${question}\n\n回答要求：\n1. 先给出概述步骤\n2. 列出关键代码或配置字段\n3. 根据需要提供注意事项`
    ),
  ]

  const response = await llm.invoke(messages)

  console.log('\n🤖 AI 回答：')
  console.log(response.content)
}

const question = 'wangEditor 如何配置上传图片'
await answerQuestion(question)