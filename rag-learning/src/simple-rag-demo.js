import fs from 'fs/promises';
import path from 'path';
import crypto from 'node:crypto';
import { ChromaClient } from 'chromadb';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

class SimpleTextEmbeddings {
  constructor({ dimension = 384 } = {}) {
    this.dimension = dimension;
  }

  computeEmbedding(text) {
    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    const vector = new Array(this.dimension).fill(0);

    for (const token of tokens) {
      const hash = crypto.createHash('sha256').update(token).digest();
      const index = hash.readUInt32BE(0) % this.dimension;
      vector[index] += 1;
    }

    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    if (norm > 0) {
      return vector.map(value => value / norm);
    }
    return vector;
  }

  async embedQuery(text) {
    return this.computeEmbedding(text);
  }

  async embedDocuments(texts) {
    return texts.map(text => this.computeEmbedding(text));
  }
}

class SimpleRAGDemo {
  constructor() {
    this.embeddings = new SimpleTextEmbeddings();
    this.client = new ChromaClient({
      path: "http://localhost:8000"
    });
    this.collectionName = "simple_pdf_rag_demo";
    this.pdfPath = path.join(process.cwd(), 'files', 'nke-10k-2023.pdf');
  }

  async loadPDF() {
    console.log('📖 加载 PDF:', this.pdfPath);
    await fs.access(this.pdfPath);

    const loader = new PDFLoader(this.pdfPath);
    const docs = await loader.load();
    const fullText = docs.map(doc => doc.pageContent).join('\n\n');

    console.log(`✅ PDF 加载完成，页数 ${docs.length}，总字数 ${fullText.length}`);
    return fullText;
  }

  async splitText(text) {
    console.log('✂️ 开始分块处理文本...');
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '.', ' ', '']
    });
    const chunks = await splitter.splitText(text);
    console.log(`✅ 生成 ${chunks.length} 个文本块`);
    return chunks;
  }

  async embedAndStore(chunks) {
    console.log('🧠 生成嵌入并写入 Chroma...');
    try {
      await this.client.deleteCollection({ name: this.collectionName });
      console.log('🗑️ 删除已有集合');
    } catch (error) {
      // ignore
    }

    const collection = await this.client.createCollection({
      name: this.collectionName,
      metadata: { description: "Simple RAG demo without external LLM." }
    });

    const embeddings = await this.embeddings.embedDocuments(chunks);
    const ids = chunks.map((_, index) => `chunk_${index}`);
    const metadatas = chunks.map((chunk, index) => ({
      chunk_index: index,
      chunk_length: chunk.length,
      source: 'nke-10k-2023.pdf'
    }));

    await collection.add({
      ids,
      embeddings,
      documents: chunks,
      metadatas
    });

    console.log('✅ 写入 Chroma 完成');
    return collection;
  }

  async search(collection, query) {
    console.log(`\n🔎 检索: "${query}"`);
    const queryEmbedding = await this.embeddings.embedQuery(query);

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 3,
      include: ["documents", "distances", "metadatas"]
    });

    const documents = results.documents?.[0] ?? [];
    const distances = results.distances?.[0] ?? [];
    const metadatas = results.metadatas?.[0] ?? [];

    documents.forEach((doc, idx) => {
      const distance = distances[idx];
      const similarity = distance != null ? (1 - distance).toFixed(4) : 'N/A';
      const metadata = metadatas[idx];
      console.log(`📄 结果 ${idx + 1}: 相似度 ${similarity}`);
      console.log(`   索引 ${metadata?.chunk_index}, 长度 ${metadata?.chunk_length}`);
      console.log(`   预览: ${doc.slice(0, 200)}${doc.length > 200 ? '...' : ''}`);
    });
  }

  async runDemo() {
    const text = await this.loadPDF();
    const chunks = await this.splitText(text);
    const collection = await this.embedAndStore(chunks);

    const queries = [
      "Nike revenue performance in 2023",
      "Nike sustainability initiatives"
    ];

    for (const query of queries) {
      await this.search(collection, query);
    }

    console.log('\n🎉 RAG 演示完成');
  }
}

async function main() {
  try {
    const demo = new SimpleRAGDemo();
    await demo.runDemo();
  } catch (error) {
    console.error('\n❌ 演示过程出错:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('请先启动本地 ChromaDB，例如运行: docker run -d -p 8000:8000 chromadb/chroma:latest');
    } else if (error.code === 'ENOENT') {
      console.error('请确认 PDF 文件存在于 files/nke-10k-2023.pdf');
    }
    process.exit(1);
  }
}

main();

