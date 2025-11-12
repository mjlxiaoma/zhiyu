import { ChromaClient } from 'chromadb';

const client = new ChromaClient({
  path: "http://localhost:8000"
});

async function checkCollections() {
  try {
    console.log('📋 正在查询 ChromaDB 中的所有集合...\n');

    const collections = await client.listCollections();

    if (collections.length === 0) {
      console.log('❌ 没有找到任何集合');
      console.log('\n💡 提示: 您需要先运行 rag-demo.js 来创建并填充 nike_10k_2023 集合');
      console.log('   运行命令: npm run rag-demo');
    } else {
      console.log(`✅ 找到 ${collections.length} 个集合:\n`);

      for (const collection of collections) {
        console.log(`📦 集合名称: ${collection.name}`);
        console.log(`   ID: ${collection.id}`);
        console.log(`   元数据: ${JSON.stringify(collection.metadata || {})}`);

        // 获取集合详情
        const col = await client.getCollection({ name: collection.name });
        const count = await col.count();
        console.log(`   文档数量: ${count}`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

checkCollections();
