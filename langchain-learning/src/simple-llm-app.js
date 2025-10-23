import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import "dotenv/config";

// ----------------------------
// const llm = new ChatDeepSeek({
//   model: 'deepseek-chat',
// })

// const messages = [
//   new SystemMessage('你是一个中文AI助手，后面所有回答都用中文'),
//   new HumanMessage('看看北京近一周的天气怎么样？，再看看陕西的天气，做一个横向气温对比,说一下两个城市气温差异。'),
// ]

// const res = await llm.invoke(messages)
// console.log(res) // 打印结果如下

/** 
 * AIMessage {
  "id": "2bec1685-b028-4006-a649-5cb9cb88a628",
  "content": "根据最新的天气预报数据，以下是北京和陕西（以省会西安为例）近一周的天气及气温对比分析：\n\n---\n\n### **北京近一周天气（日期范围：假设为当前周）**\n- **气温范围**：白天最高气温 **28°C~32°C**，夜间最低气温 **18°C~22°C**\n- **天气特点**：以晴到多云为主，偶有阵雨，湿度适中，昼夜温差较明显。\n\n---\n\n### **陕西（西安）近一周天气**\n- **气温范围**：白天最高气温 **30°C~35°C**，夜间最低气温 **20°C~24°C**\n- **天气特点**：以晴天为主，局部地区有高温，湿度较低，昼夜温差略小于北京。\n\n---\n\n### **两地气温差异分析**\n1. **最高气温**：\n   - 西安比北京平均高 **2°C~3°C**，尤其午后高温更为显著。\n2. **最低气温**：\n   - 两地夜间温度接近，但西安略高 **1°C~2°C**。\n3. **昼夜温差**：\n   - 北京昼夜温差更大（约 **8°C~10°C**），西安温差较小（约 **6°C~8°C**）。\n4. **体感差异**：\n   - 北京天气较为干爽，西安因高温和较低湿度，体感可能更显炎热。\n\n---\n\n### **总结**\n北京气温总体较为温和，昼夜温差大；西安气温偏高，尤其白天炎热，需注意防暑。两地均以晴好天气为主，适合出行，但西安需加强高温防护。",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "promptTokens": 40,
      "completionTokens": 349,
      "totalTokens": 389
    },
    "finish_reason": "stop",
    "model_provider": "openai",
    "model_name": "deepseek-chat",
    "usage": {
      "prompt_tokens": 40,
      "completion_tokens": 349,
      "total_tokens": 389,
      "prompt_tokens_details": {
        "cached_tokens": 0
      },
      "prompt_cache_hit_tokens": 0,
      "prompt_cache_miss_tokens": 40
    },
    "system_fingerprint": "fp_ffc7281d48_prod0820_fp8_kvcache"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "output_tokens": 349,
    "input_tokens": 40,
    "total_tokens": 389,
    "input_token_details": {
      "cache_read": 0
    },
    "output_token_details": {}
  }
}

invoke 可以输入多种形式，如下：

await llm.invoke("Hello");

await llm.invoke([{ role: "user", content: "Hello" }]);

await llm.invoke([new HumanMessage("hi!")]);

// ------------------------------------------------------------


 */

//  现在用 langchain 生成 stream

// const llm = new ChatDeepSeek({
//   model: 'deepseek-chat',
// })

// const messages = [
//   new SystemMessage('你是一个中文AI助手，后面所有回答都用中文'),
//   new HumanMessage('看看北京近一周的天气怎么样？，再看看陕西的天气，做一个横向气温对比,说一下两个城市气温差异。'),
// ]

// const stream = await llm.stream(messages)
// const chunks = []
// // 便利获取stream流
// for await (const chunk of stream) {
//   chunks.push(chunk)
//   console.log(`${chunk.content}|`)
// }
// ------------------------------------------------------------

// Prompt template 提示词模板
// 在一个 Agent 系统中，prompt 提示词 一般是单独放在一个代码文件中的，就像一个常量一样。
// 但有时候 prompt 也不是完全不定不变的，它可能会有一些变量。此时就需要模板，例如
// const systemTemplate = "Translate the following from English into {language}";  language就相当于一个变量
// 定义 template

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const systemTemplate = 'Please answer the following questions in {language}'
const promptTemplate = ChatPromptTemplate.fromMessages([
  ['system', systemTemplate],
  ['user', '{text}'],
])

// 根据 template 生成 prompt 值
const promptValue = await promptTemplate.invoke({
  language: 'Chinese',
  text: '看看北京今天的天气怎么样?',
})

// 调用 prompt 生成 AI 结果
const res = await llm.invoke(promptValue)
console.log(`${res.content}`)