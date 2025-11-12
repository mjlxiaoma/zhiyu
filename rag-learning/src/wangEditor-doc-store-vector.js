import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { ChromaClient } from 'chromadb'
import { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import dotenv from 'dotenv'
import path from 'path'
import { promises as fs } from 'fs'

dotenv.config()

const VECTOR_STORE_URL = 'http://localhost:8000'
const COLLECTION_NAME = 'wangEditor-doc'
const SOURCE_FILE_NAME = 'wangEditor-doc.md'

const chromaClient = new ChromaClient({
  path: VECTOR_STORE_URL,
})

async function loadMarkdownFile(filePath) {
  console.log(`📄 正在加载 Markdown 文件: ${filePath}`)
  const content = await fs.readFile(filePath, 'utf-8')
  console.log(`✅ 文件加载完成，字符数: ${content.length}`)
  return content
}

async function splitMarkdownContent(content) {
  console.log('✂️ 开始分割文本...')
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '。', '！', '？', '.', ' ', ''],
  })

  const baseDocument = new Document({
    pageContent: content,
    metadata: { source: SOURCE_FILE_NAME },
  })

  const documents = await splitter.splitDocuments([baseDocument])
  const documentsWithIndex = documents.map(
    (doc, index) =>
      new Document({
        pageContent: doc.pageContent,
        metadata: { ...doc.metadata, chunk_index: index },
      })
  )

  console.log(`✅ 文本分割完成，共生成 ${documentsWithIndex.length} 个片段`)
  return documentsWithIndex
}

async function clearExistingCollection() {
  console.log(`🧹 清理集合 ${COLLECTION_NAME}...`)
  try {
    await chromaClient.deleteCollection({ name: COLLECTION_NAME })
    console.log('✅ 已删除旧的集合')
  } catch (error) {
    if (error.message?.includes('NotFound') || error.message?.includes('does not exist')) {
      console.log('ℹ️ 目标集合不存在，跳过删除步骤')
    } else {
      console.warn(`⚠️ 删除集合时出现非致命错误: ${error.message}`)
    }
  }
}

async function storeDocuments(documents) {
  console.log('🧠 正在生成向量并写入 Chroma...')
  const embeddings = new AlibabaTongyiEmbeddings({})

  const vectorStore = await Chroma.fromDocuments(documents, embeddings, {
    collectionName: COLLECTION_NAME,
    url: VECTOR_STORE_URL,
    collectionMetadata: {
      source: SOURCE_FILE_NAME,
      chunk_size: 1000,
      chunk_overlap: 200,
    },
  })

  console.log(`✅ 已成功写入 ${documents.length} 条向量数据`)
  return vectorStore
}

async function runSmokeTests(vectorStore, expectedCount) {
  console.log('\n🧪 开始运行简单测试...')

  const collection = await chromaClient.getCollection({ name: COLLECTION_NAME })
  const count = await collection.count()

  if (count !== expectedCount) {
    throw new Error(`集合内文档数量为 ${count}，与预期的 ${expectedCount} 不一致`)
  }
  console.log(`✅ 文档数量测试通过: ${count} 条记录`)

  const sample = await collection.get({
    limit: 1,
    include: ['documents', 'metadatas'],
  })
  const firstDocument = sample.documents?.[0]?.[0]

  if (!firstDocument) {
    throw new Error('无法从集合中读取示例文档')
  }
  console.log(`✅ 示例文档读取成功，长度: ${firstDocument.length}`)

  const testQueries = ['wangEditor 功能', '富文本 编辑器', '图片 上传']
  for (const query of testQueries) {
    const results = await vectorStore.similaritySearch(query, 2)
    if (results.length === 0) {
      throw new Error(`查询 "${query}" 未返回任何结果`)
    }
    console.log(`🔍 查询 "${query}" 返回 ${results.length} 条结果，首条片段长度: ${results[0].pageContent.length}`)
  }

  console.log('🧪 测试全部通过\n')
}

async function resolveMarkdownPath() {
  const candidates = [
    path.resolve(process.cwd(), 'files', SOURCE_FILE_NAME),
    path.resolve(process.cwd(), 'files', 'files', SOURCE_FILE_NAME),
    path.resolve(process.cwd(), SOURCE_FILE_NAME),
  ]

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch (error) {
      // continue trying next candidate
    }
  }

  throw new Error(`未找到 Markdown 文件，尝试路径:\n${candidates.join('\n')}`)
}

async function main() {
  try {
    const markdownPath = await resolveMarkdownPath()
    const content = await loadMarkdownFile(markdownPath)

    const documents = await splitMarkdownContent(content)
    await clearExistingCollection()

    const vectorStore = await storeDocuments(documents)
    await runSmokeTests(vectorStore, documents.length)

    console.log('🎉 wangEditor 文档向量化流程已完成')
  } catch (error) {
    console.error(`❌ 处理过程中出现错误: ${error.message}`)
    if (error.message.includes('ECONNREFUSED')) {
      console.error('无法连接到 Chroma 服务，请确认 http://localhost:8000 已启动')
    }
    process.exit(1)
  }
}

main()