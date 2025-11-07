import { CloudClient } from 'chromadb'
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import 'dotenv/config'

// 初始化嵌入模型
const embeddings = new AlibabaTongyiEmbeddings({});

const client = new CloudClient({
  apiKey: 'ck-AtSTs91CUVzgWDGMbNic7DMBws53hxuaxdqB15bgJDGK',
  tenant: '0176c1ab-9226-42b4-829b-bb1d128b2fe4',
  database: 'test',
})

async function runChromaTest() {
  try {
    console.log('🚀 开始 ChromaDB 云服务测试...\n');

    // 创建集合（不使用默认嵌入函数）
    const collection = await client.getOrCreateCollection({
      name: 'test_collection_custom',
    })

    // 准备文档和嵌入
    const documents = [
      '苹果是一种常见的水果，富含维生素和纤维。',
      '香蕉含有丰富的钾元素，有助于心脏健康。',
      '橙子富含维生素C，能够增强免疫系统。'
    ];

    console.log('📊 生成文档嵌入向量...');
    const documentEmbeddings = await Promise.all(
      documents.map(doc => embeddings.embedQuery(doc))
    );

    // 添加文档（提供自定义嵌入）
    console.log('💾 添加文档到集合...');
    await collection.add({
      ids: ['id1', 'id2', 'id3'],
      documents: documents,
      embeddings: documentEmbeddings,
    })

    // 查询
    const queryText = '橙子是什么水果？';
    console.log(`🔍 查询: ${queryText}`);
    
    console.log('📊 生成查询嵌入向量...');
    const queryEmbedding = await embeddings.embedQuery(queryText);

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding], // 使用自定义嵌入
      nResults: 2,
    })

    console.log('\n✅ 查询结果:');
    console.log('文档:', results.documents[0]);
    console.log('距离:', results.distances[0]);
    console.log('IDs:', results.ids[0]);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.message.includes('fetch failed') || error.message.includes('timeout')) {
      console.log('\n💡 网络问题解决方案:');
      console.log('1. 检查网络连接');
      console.log('2. 尝试使用代理或VPN');
      console.log('3. 使用本地 ChromaDB 服务');
    }
  }
}

runChromaTest();
