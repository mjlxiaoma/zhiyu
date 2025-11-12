import { ChromaClient } from 'chromadb';
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import 'dotenv/config';

/**
 * 将 pdf_rag_demo 集合重命名/复制为 nike_10k_2023
 */

async function copyCollection() {
  try {
    console.log('🚀 开始复制集合...\n');

    const client = new ChromaClient({
      path: "http://localhost:8000"
    });

    const embeddings = new AlibabaTongyiEmbeddings({
      apiKey: process.env.ALIBABA_API_KEY,
    });

    // 获取源集合
    console.log('📖 读取源集合: pdf_rag_demo');
    const sourceCollection = await client.getCollection({
      name: 'pdf_rag_demo'
    });

    const sourceCount = await sourceCollection.count();
    console.log(`   文档数量: ${sourceCount}\n`);

    // 获取所有数据
    console.log('📥 获取所有文档数据...');
    const allData = await sourceCollection.get({
      include: ['documents', 'embeddings', 'metadatas']
    });

    console.log(`✅ 获取到 ${allData.ids.length} 个文档\n`);

    // 删除已存在的目标集合（如果存在）
    try {
      await client.deleteCollection({ name: 'nike_10k_2023' });
      console.log('🗑️ 删除已存在的 nike_10k_2023 集合\n');
    } catch (error) {
      // 集合不存在，忽略
    }

    // 创建新集合
    console.log('📦 创建新集合: nike_10k_2023');
    const targetCollection = await client.createCollection({
      name: 'nike_10k_2023',
      metadata: {
        description: "Nike 10-K 2023 Annual Report - RAG Vector Store",
        source: "nke-10k-2023.pdf"
      }
    });

    // 分批复制数据
    const batchSize = 100;
    const totalBatches = Math.ceil(allData.ids.length / batchSize);

    console.log(`\n📊 开始分批复制数据 (每批 ${batchSize} 个文档)...\n`);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, allData.ids.length);

      const batchIds = allData.ids.slice(start, end);
      const batchDocuments = allData.documents.slice(start, end);
      const batchEmbeddings = allData.embeddings.slice(start, end);
      const batchMetadatas = allData.metadatas.slice(start, end);

      console.log(`   批次 ${i + 1}/${totalBatches}: 复制文档 ${start + 1}-${end}`);

      await targetCollection.add({
        ids: batchIds,
        documents: batchDocuments,
        embeddings: batchEmbeddings,
        metadatas: batchMetadatas
      });

      // 避免API限制
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 验证复制结果
    const targetCount = await targetCollection.count();
    console.log(`\n✅ 复制完成！`);
    console.log(`   源集合 (pdf_rag_demo): ${sourceCount} 个文档`);
    console.log(`   目标集合 (nike_10k_2023): ${targetCount} 个文档`);

    if (sourceCount === targetCount) {
      console.log('\n🎉 数据完整性验证通过！');
    } else {
      console.log('\n⚠️ 警告: 文档数量不匹配，请检查');
    }

  } catch (error) {
    console.error('\n❌ 复制失败:', error.message);
    console.error(error);
  }
}

copyCollection();
