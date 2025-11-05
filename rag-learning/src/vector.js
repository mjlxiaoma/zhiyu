import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import 'dotenv/config'

const model = new AlibabaTongyiEmbeddings({});
const res = await model.embedQuery(
  "介绍一下自己"
);

// 1. 向量维度（元素个数）
const dimension = res.length;
console.log('向量维度（元素个数）:', dimension);

// 2. 向量模长（欧几里得距离 / L2 范数）
const magnitude = Math.sqrt(res.reduce((sum, val) => sum + val * val, 0));
console.log('向量模长（欧几里得距离）:', magnitude);

// 3. 归一化向量（常用于相似度计算）
const normalizedVector = res.map(val => val / magnitude);
const normalizedMagnitude = Math.sqrt(normalizedVector.reduce((sum, val) => sum + val * val, 0));
console.log('归一化后的向量模长:', normalizedMagnitude); // 应该接近 1

console.log('\n向量示例（前10个元素）:', res.slice(0, 10));