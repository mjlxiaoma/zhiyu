import OpenAI from 'openai';
import dotenv from 'dotenv';

// 加载 .env 文件中的环境变量
dotenv.config();

// 从环境变量中获取 DeepSeek API Key
const apiKey = process.env.DEEPSEEK_API_KEY;

if (!apiKey) {
  console.error('错误: 请设置环境变量 DEEPSEEK_API_KEY');
  process.exit(1);
}

// 创建 OpenAI 客户端，配置为 DeepSeek API 端点
const client = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.deepseek.com/v1'
});

// 使用 deepseek-reasoner 模型进行推理（带调试信息）
async function reasonerChatDebug() {
  console.log('='.repeat(80));
  console.log('DeepSeek Reasoner 调试模式');
  console.log('='.repeat(80));
  console.log('\n问题: 天空为什么是蓝色的\n');
  
  try {
    const stream = await client.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [
        { 
          role: 'user', 
          content: '天空为什么是蓝色的' 
        }
      ],
      stream: true
    });

    let chunkCount = 0;
    let hasReasoningContent = false;
    let hasContent = false;

    console.log('开始接收流式数据...\n');

    // 逐个处理流式响应
    for await (const chunk of stream) {
      chunkCount++;
      
      // 打印前几个 chunk 的完整结构
      if (chunkCount <= 3) {
        console.log(`\n--- Chunk ${chunkCount} 完整数据 ---`);
        console.log(JSON.stringify(chunk, null, 2));
        console.log('--- End Chunk ---\n');
      }

      const delta = chunk.choices[0]?.delta;
      
      if (!delta) {
        console.log(`[Chunk ${chunkCount}] delta 为空`);
        continue;
      }

      // 检查 delta 中有哪些字段
      const deltaKeys = Object.keys(delta);
      if (deltaKeys.length > 0 && chunkCount > 3) {
        console.log(`[Chunk ${chunkCount}] delta 包含字段:`, deltaKeys);
      }

      // 处理推理过程（reasoning_content）
      if (delta.reasoning_content) {
        if (!hasReasoningContent) {
          console.log('\n🧠 【检测到推理内容 - reasoning_content】');
          console.log('-'.repeat(80));
          hasReasoningContent = true;
        }
        process.stdout.write(delta.reasoning_content);
      }

      // 处理最终回答（content）
      if (delta.content) {
        if (!hasContent) {
          console.log('\n\n💡 【检测到回答内容 - content】');
          console.log('-'.repeat(80));
          hasContent = true;
        }
        process.stdout.write(delta.content);
      }
    }
    
    console.log('\n\n' + '='.repeat(80));
    console.log(`总共接收了 ${chunkCount} 个 chunk`);
    console.log(`包含推理内容: ${hasReasoningContent ? '是' : '否'}`);
    console.log(`包含回答内容: ${hasContent ? '是' : '否'}`);
    console.log('='.repeat(80));
  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    if (error.response) {
      console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 执行推理对话
reasonerChatDebug();

