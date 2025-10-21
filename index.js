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

// 流式输出聊天完成
async function streamChat() {
  console.log('开始流式对话...\n');
  
  try {
    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个友好的 AI 助手。请始终使用中文回答所有问题。' },
        { role: 'user', content: '请用 100 字以内介绍一下 Node.js 的特点。' }
      ],
      stream: true,
      temperature: 1.0
    });

    // 逐个处理流式响应
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // 实时输出内容（不换行）
        process.stdout.write(content);
      }
    }
    
    console.log('\n\n流式输出完成！');
  } catch (error) {
    console.error('发生错误:', error.message);
  }
}

// 执行流式对话
streamChat();

