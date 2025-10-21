# Node.js DeepSeek API 示例

这是一个使用 OpenAI SDK 调用 DeepSeek API 的 Node.js 示例项目，展示了如何使用流式输出（Stream）功能。

## 特点

- ✅ 使用 Node.js v22+ 原生代码
- ✅ ES Module 语法
- ✅ 使用官方 `openai` npm 包
- ✅ 支持流式输出（Stream）
- ✅ 无需任何 Web 框架

## 环境要求

- Node.js v22 或更高版本
- DeepSeek API Key

## 安装

1. 克隆或下载此项目

2. 安装依赖：
```bash
npm install
```

3. 设置环境变量：

**Windows PowerShell:**
```powershell
$env:DEEPSEEK_API_KEY="your_deepseek_api_key_here"
```

**Windows CMD:**
```cmd
set DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

**Linux/macOS:**
```bash
export DEEPSEEK_API_KEY="your_deepseek_api_key_here"
```

## 使用方法

### 1. 运行主程序（流式输出示例）

```bash
npm start
```

### 2. 运行其他示例

查看 `examples/` 目录下的更多示例：

```bash
# 流式聊天示例
npm run stream

# 普通聊天示例
npm run chat
```

## 代码说明

### 核心配置

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'  // DeepSeek API 端点
});
```

### 流式输出

```javascript
const stream = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [
    { role: 'user', content: '你好！' }
  ],
  stream: true  // 启用流式输出
});

// 逐个处理响应片段
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  if (content) {
    process.stdout.write(content);
  }
}
```

## API 参数说明

- `model`: 模型名称，如 `deepseek-chat` 或 `deepseek-coder`
- `messages`: 对话消息数组
- `stream`: 设置为 `true` 启用流式输出
- `temperature`: 控制随机性，范围 0-2，默认 1.0
- `max_tokens`: 最大输出 token 数量

## 注意事项

1. 请确保已设置 `DEEPSEEK_API_KEY` 环境变量
2. DeepSeek API 与 OpenAI API 兼容，因此可以使用 openai npm 包
3. 流式输出可以实现打字机效果，提升用户体验
4. 本项目仅使用 Node.js 原生代码，无任何 Web 框架依赖

## 获取 API Key

访问 [DeepSeek 开放平台](https://platform.deepseek.com/) 注册并获取 API Key。

## 许可

MIT License

