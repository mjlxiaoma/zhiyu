require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(express.static('src'));

// 配置 OpenAI 客户端连接 DeepSeek
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

// 根路径重定向到聊天页面
app.get('/', (req, res) => {
  res.redirect('/chat');
});

// 聊天页面路由
app.get('/chat', (req, res) => {
  res.sendFile('chat.html', { root: 'src' });
});

// SSE 流式聊天接口
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // 调用 DeepSeek API 并开启流式响应
    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: message }],
      stream: true
    });

    // 处理流式数据
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // 以 SSE 格式发送数据
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // 发送结束标记
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

