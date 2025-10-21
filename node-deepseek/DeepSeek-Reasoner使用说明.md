# DeepSeek Reasoner 使用说明

## 什么是 DeepSeek Reasoner？

DeepSeek Reasoner 是 DeepSeek 的推理模型，它会：
1. **先展示推理过程** - 模型如何思考问题
2. **再给出最终答案** - 基于推理得出的结论

这种模式特别适合需要逻辑推理的问题，比如数学、物理、编程等。

## 运行示例

```powershell
# 运行 reasoner 示例
npm run reason

# 运行调试版本（查看详细数据结构）
npm run debug
```

## 代码说明

### 核心配置

```javascript
const stream = await client.chat.completions.create({
  model: 'deepseek-reasoner',  // 使用 reasoner 模型
  messages: [
    { 
      role: 'user', 
      content: '天空为什么是蓝色的' 
    }
  ],
  stream: true  // 启用流式输出
});
```

### 流式响应处理

DeepSeek Reasoner 的流式响应中，每个 chunk 的 delta 包含两个字段：

```javascript
{
  "reasoning_content": "推理过程的文本片段",
  "content": "最终答案的文本片段"
}
```

### 处理逻辑

```javascript
for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta;
  
  // 1. 处理推理过程
  if (delta.reasoning_content && delta.reasoning_content.trim()) {
    // 显示 🧠 【推理过程】
    process.stdout.write(delta.reasoning_content);
  }

  // 2. 处理最终答案
  if (delta.content && delta.content.trim()) {
    // 显示 💡 【最终答案】
    process.stdout.write(delta.content);
  }
}
```

## 输出示例

```
================================================================================
使用 DeepSeek Reasoner 模型回答问题
================================================================================

问题: 天空为什么是蓝色的

🧠 【推理过程】
--------------------------------------------------------------------------------
用户问的是"天空为什么是蓝色的"，这是一个经典的物理学问题...
需要从光的波长和大气相互作用的角度解释...
--------------------------------------------------------------------------------

💡 【最终答案】
--------------------------------------------------------------------------------
当然！这是一个非常经典的问题。简单来说，**天空之所以是蓝色的，
是因为太阳光中的蓝色光被地球大气层中的空气分子散射得最多。**
...
================================================================================
✅ 推理完成！
================================================================================
```

## 适用场景

DeepSeek Reasoner 特别适合以下类型的问题：

### ✅ 推荐使用
- 数学问题求解
- 物理/化学现象解释
- 逻辑推理题
- 编程算法设计
- 复杂问题分析

### ❌ 不推荐使用
- 简单的对话聊天
- 创意写作
- 翻译任务
- 信息查询

对于普通聊天，使用 `deepseek-chat` 模型即可（见 `index.js`）。

## 自定义问题

编辑 `reason-demo.js` 第 32-36 行：

```javascript
messages: [
  { 
    role: 'user', 
    content: '你的问题写在这里'  // 修改这里
  }
]
```

## 关键参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `model` | 模型名称 | `'deepseek-reasoner'` |
| `stream` | 是否流式输出 | `true` |
| `temperature` | 随机性（0-2） | 1.0（可选） |
| `max_tokens` | 最大输出长度 | 不限制（可选） |

## 注意事项

1. **reasoning_content 和 content 同时存在**  
   在流式响应中，两个字段可能同时出现在同一个 chunk 中，需要分别处理。

2. **空字符串判断**  
   使用 `.trim()` 判断内容是否为空，避免输出空白内容。

3. **API 调用成本**  
   Reasoner 模型因为输出推理过程，token 消耗会比普通模型更多。

4. **推理过程为中文**  
   DeepSeek Reasoner 会根据问题语言自动选择推理过程的语言。

## 调试技巧

如果遇到问题，运行调试版本查看完整的数据结构：

```powershell
npm run debug
```

这会输出前 3 个 chunk 的完整 JSON 结构，帮助理解 API 返回的数据格式。

## 更多信息

- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [OpenAI SDK 文档](https://github.com/openai/openai-node)

