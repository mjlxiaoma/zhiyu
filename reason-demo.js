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

// 使用 deepseek-reasoner 模型进行推理
async function reasonerChat() {
  console.log('='.repeat(80));
  console.log('使用 DeepSeek Reasoner 模型回答问题');
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

    let hasReasoningContent = false;
    let hasAnswerContent = false;
    let reasoningText = '';
    let answerText = '';

    // 逐个处理流式响应
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      
      if (!delta) continue;

      // 处理推理过程（reasoning_content）
      if (delta.reasoning_content && delta.reasoning_content.trim()) {
        reasoningText += delta.reasoning_content;
        
        // 如果是第一次输出推理内容，先打印标题
        if (!hasReasoningContent) {
          console.log('🧠 【推理过程】');
          console.log('-'.repeat(80));
          hasReasoningContent = true;
        }
        process.stdout.write(delta.reasoning_content);
      }

      // 处理最终回答（content）
      if (delta.content && delta.content.trim()) {
        answerText += delta.content;
        
        // 如果刚开始输出答案内容，打印分隔符和标题
        if (!hasAnswerContent) {
          console.log('\n' + '-'.repeat(80));
          console.log('\n💡 【最终答案】');
          console.log('-'.repeat(80));
          hasAnswerContent = true;
        }
        process.stdout.write(delta.content);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ 推理完成！');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
  }
}

// 执行推理对话
reasonerChat();

