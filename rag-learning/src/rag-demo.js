import fs from 'fs/promises';
import path from 'path';
import { ChromaClient } from 'chromadb';
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import 'dotenv/config';

/**
 * RAG (Retrieval-Augmented Generation) 演示
 * 1. 加载 PDF 文件
 * 2. 分块处理文本 (1000字符，重叠200字符)
 * 3. 生成嵌入向量
 * 4. 存储到本地 ChromaDB
 * 5. 执行检索演示
 */

class RAGDemo {
  constructor() {
    // 初始化嵌入模型
    this.embeddings = new AlibabaTongyiEmbeddings({});
    
    // 初始化本地 ChromaDB 客户端
    this.client = new ChromaClient({
      path: "http://localhost:8000"
    });
    
    this.collectionName = "pdf_rag_demo";
    this.pdfPath = path.join(process.cwd(), 'files', 'nke-10k-2023.pdf');
  }

  /**
   * 步骤1: 加载 PDF 文件内容
   */
  async loadPDF() {
    console.log('📖 正在加载 PDF 文件:', this.pdfPath);
    
    try {
      // 检查文件是否存在
      await fs.access(this.pdfPath);
      
      // 使用 LangChain 的 PDF 加载器
      const loader = new PDFLoader(this.pdfPath);
      const docs = await loader.load();
      
      // 合并所有页面的内容
      const fullText = docs.map(doc => doc.pageContent).join('\n\n');
      
      console.log(`✅ PDF 加载成功! 总页数: ${docs.length}, 总字符数: ${fullText.length}`);
      console.log(`📄 前200字符预览: ${fullText.substring(0, 200)}...\n`);
      
      return fullText;
    } catch (error) {
      console.error('❌ PDF 加载失败:', error.message);
      throw error;
    }
  }

  /**
   * 步骤2: 分块处理文本
   */
  async chunkText(text) {
    console.log('✂️ 正在分块处理文本...');
    
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,        // 每块1000字符
      chunkOverlap: 200,      // 重叠200字符
      separators: ['\n\n', '\n', '.', ' ', ''] // 分割优先级
    });

    const chunks = await textSplitter.splitText(text);
    
    console.log(`✅ 文本分块完成! 共生成 ${chunks.length} 个文本块`);
    console.log(`📊 平均每块长度: ${Math.round(chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length)} 字符`);
    console.log(`📄 第一个块预览: ${chunks[0].substring(0, 150)}...\n`);
    
    return chunks;
  }

  /**
   * 步骤3&4: 生成嵌入向量并存储到 ChromaDB
   */
  async embedAndStore(chunks) {
    console.log('🧠 正在生成嵌入向量...');
    
    try {
      // 创建或获取集合（删除已存在的集合以确保清洁环境）
      try {
        await this.client.deleteCollection({ name: this.collectionName });
        console.log('🗑️ 删除已存在的集合');
      } catch (error) {
        // 集合不存在，忽略错误
      }
      
      const collection = await this.client.createCollection({
        name: this.collectionName,
        metadata: { description: "Nike 10-K 2023 PDF 文档的 RAG 向量存储" }
      });

      // 分批处理嵌入向量（避免API限制）
      const batchSize = 10;
      const totalBatches = Math.ceil(chunks.length / batchSize);
      
      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, chunks.length);
        const batchChunks = chunks.slice(start, end);
        
        console.log(`📊 处理批次 ${i + 1}/${totalBatches} (${start + 1}-${end})`);
        
        // 生成嵌入向量
        const embeddings = await Promise.all(
          batchChunks.map(chunk => this.embeddings.embedQuery(chunk))
        );
        
        // 准备数据
        const ids = batchChunks.map((_, index) => `chunk_${start + index}`);
        const documents = batchChunks;
        const metadatas = batchChunks.map((chunk, index) => ({
          chunk_index: start + index,
          chunk_length: chunk.length,
          source: 'nke-10k-2023.pdf'
        }));
        
        // 添加到集合
        await collection.add({
          ids: ids,
          embeddings: embeddings,
          documents: documents,
          metadatas: metadatas
        });
        
        // 避免API限制，添加短暂延迟
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log(`✅ 所有 ${chunks.length} 个文本块已成功存储到 ChromaDB!\n`);
      return collection;
      
    } catch (error) {
      console.error('❌ 嵌入向量生成或存储失败:', error.message);
      throw error;
    }
  }

  /**
   * 步骤5: 执行检索演示
   */
  async performSearch(collection, queries) {
    console.log('🔍 开始执行检索演示...\n');
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`🔍 检索 ${i + 1}: "${query}"`);
      console.log('─'.repeat(60));
      
      try {
        // 生成查询的嵌入向量
        const queryEmbedding = await this.embeddings.embedQuery(query);
        
        // 执行相似度搜索
        const results = await collection.query({
          queryEmbeddings: [queryEmbedding],
          nResults: 3, // 返回最相似的3个结果
          include: ['documents', 'distances', 'metadatas']
        });
        
        // 显示检索结果
        console.log(`📊 找到 ${results.documents[0].length} 个相关文档片段:\n`);
        
        results.documents[0].forEach((doc, index) => {
          const distance = results.distances[0][index];
          const metadata = results.metadatas[0][index];
          const similarity = (1 - distance).toFixed(4); // 转换为相似度分数
          
          console.log(`📄 结果 ${index + 1}:`);
          console.log(`   📈 相似度分数: ${similarity} (距离: ${distance.toFixed(4)})`);
          console.log(`   📑 文档块索引: ${metadata.chunk_index}`);
          console.log(`   📏 文档长度: ${metadata.chunk_length} 字符`);
          console.log(`   📖 内容预览: ${doc.substring(0, 200)}${doc.length > 200 ? '...' : ''}`);
          console.log('   ' + '─'.repeat(50));
        });
        
        console.log('\n');
        
      } catch (error) {
        console.error(`❌ 检索 ${i + 1} 失败:`, error.message);
      }
    }
  }

  /**
   * 运行完整的 RAG 演示
   */
  async run() {
    try {
      console.log('🚀 开始 RAG (检索增强生成) 演示\n');
      console.log('=' * 60);
      
      // 步骤1: 加载PDF
      const text = await this.loadPDF();
      
      // 步骤2: 分块
      const chunks = await this.chunkText(text);
      
      // 步骤3&4: 嵌入和存储
      const collection = await this.embedAndStore(chunks);
      
      // 步骤5: 检索演示
      const searchQueries = [
        "Nike's financial performance and revenue",
        "environmental sustainability initiatives"
      ];
      
      await this.performSearch(collection, searchQueries);
      
      console.log('✅ RAG 演示完成!');
      console.log('\n💡 提示: 您可以修改 searchQueries 数组来测试不同的检索查询');
      
    } catch (error) {
      console.error('❌ RAG 演示失败:', error.message);
      
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n🔧 解决方案: 请先启动本地 ChromaDB 服务');
        console.log('   运行命令: npm run start-db');
        console.log('   或手动运行: docker run -d -p 8000:8000 --name chromadb chromadb/chroma:latest');
      }
    }
  }
}

// 运行演示
const ragDemo = new RAGDemo();
ragDemo.run();
