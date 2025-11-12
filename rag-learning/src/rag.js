import { ChromaClient } from 'chromadb';
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import { ChatDeepSeek } from "@langchain/deepseek";
import { StateGraph, END } from "@langchain/langgraph";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import 'dotenv/config';

/**
 * RAG Agent 使用 LangGraph + DeepSeek + ChromaDB
 *
 * 功能：
 * 1. 接收用户问题
 * 2. 从 ChromaDB 检索相关文档
 * 3. 使用 DeepSeek 生成答案
 * 4. 返回带有引用来源的答案
 */

class RAGAgent {
  constructor() {
    // 初始化嵌入模型 (用于查询向量化)
    this.embeddings = new AlibabaTongyiEmbeddings({
      apiKey: process.env.ALIBABA_API_KEY,
    });

    // 初始化 DeepSeek LLM
    this.llm = new ChatDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: "deepseek-chat",
      temperature: 0.7,
    });

    // 初始化本地 ChromaDB 客户端
    this.client = new ChromaClient({
      path: "http://localhost:8000"
    });

    // 配置
    this.collectionName = 'nike_10k_2023';
    this.topK = 3; // 检索前3个最相关的文档

    // 初始化 LangGraph
    this.graph = this.buildGraph();
  }

  /**
   * 构建 LangGraph 工作流
   */
  buildGraph() {
    // 定义状态接口
    const graphState = {
      question: null,        // 用户问题
      context: null,         // 检索到的上下文
      answer: null,          // 生成的答案
      sources: null,         // 来源文档
      error: null            // 错误信息
    };

    // 创建状态图
    const workflow = new StateGraph({
      channels: graphState
    });

    // 添加节点
    workflow.addNode("retrieve", this.retrieveNode.bind(this));
    workflow.addNode("generate", this.generateNode.bind(this));

    // 设置入口点
    workflow.setEntryPoint("retrieve");

    // 添加边
    workflow.addEdge("retrieve", "generate");
    workflow.addEdge("generate", END);

    // 编译图
    return workflow.compile();
  }

  /**
   * 节点1: 检索相关文档
   */
  async retrieveNode(state) {
    console.log('\n🔍 [检索节点] 开始检索相关文档...');

    try {
      const question = state.question;
      console.log(`📝 问题: ${question}`);

      // 获取集合
      const collection = await this.client.getCollection({
        name: this.collectionName
      });

      // 生成查询的嵌入向量
      console.log('🧠 生成查询向量...');
      const queryEmbedding = await this.embeddings.embedQuery(question);

      // 执行相似度搜索
      console.log(`📊 搜索前 ${this.topK} 个相关文档...`);
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: this.topK,
        include: ['documents', 'distances', 'metadatas']
      });

      // 处理检索结果
      const documents = results.documents[0] || [];
      const distances = results.distances[0] || [];
      const metadatas = results.metadatas[0] || [];

      // 构建上下文
      const context = documents.map((doc, index) => {
        const similarity = (1 - distances[index]).toFixed(4);
        return {
          content: doc,
          similarity: similarity,
          metadata: metadatas[index]
        };
      });

      // 合并文档内容
      const contextText = documents.join('\n\n---\n\n');

      console.log(`✅ 检索到 ${documents.length} 个相关文档`);
      context.forEach((doc, index) => {
        console.log(`   📄 文档 ${index + 1}: 相似度 ${doc.similarity}`);
      });

      return {
        ...state,
        context: contextText,
        sources: context
      };

    } catch (error) {
      console.error('❌ 检索失败:', error.message);
      return {
        ...state,
        error: `检索失败: ${error.message}`
      };
    }
  }

  /**
   * 节点2: 生成答案
   */
  async generateNode(state) {
    console.log('\n🤖 [生成节点] 使用 DeepSeek 生成答案...');

    try {
      // 如果检索失败，直接返回
      if (state.error) {
        return state;
      }

      const { question, context } = state;

      // 构建提示词
      const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided context.

Instructions:
- Answer the question based ONLY on the information provided in the context below
- If the context doesn't contain enough information to answer the question, say so
- Provide specific details and numbers when available
- Be concise but comprehensive
- Cite relevant parts of the context in your answer

Context:
${context}`;

      const userPrompt = `Question: ${question}

Please provide a detailed answer based on the context above.`;

      // 调用 LLM
      console.log('💬 调用 DeepSeek API...');
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt)
      ];

      const response = await this.llm.invoke(messages);
      const answer = response.content;

      console.log('✅ 答案生成完成');

      return {
        ...state,
        answer: answer
      };

    } catch (error) {
      console.error('❌ 生成答案失败:', error.message);
      return {
        ...state,
        error: `生成答案失败: ${error.message}`
      };
    }
  }

  /**
   * 运行 RAG Agent
   */
  async query(question) {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 RAG Agent 启动');
    console.log('='.repeat(60));

    try {
      // 初始化状态
      const initialState = {
        question: question,
        context: null,
        answer: null,
        sources: null,
        error: null
      };

      // 运行图
      const finalState = await this.graph.invoke(initialState);

      // 输出结果
      console.log('\n' + '='.repeat(60));
      console.log('📋 RAG Agent 结果');
      console.log('='.repeat(60));

      if (finalState.error) {
        console.log(`\n❌ 错误: ${finalState.error}`);
        return finalState;
      }

      console.log(`\n❓ 问题:\n${finalState.question}`);

      console.log(`\n📚 检索到的来源 (${finalState.sources?.length || 0} 个):`);
      finalState.sources?.forEach((source, index) => {
        console.log(`\n📄 来源 ${index + 1}:`);
        console.log(`   相似度: ${source.similarity}`);
        console.log(`   内容预览: ${source.content.substring(0, 150)}...`);
      });

      console.log(`\n💡 答案:\n${finalState.answer}`);

      console.log('\n' + '='.repeat(60));

      return finalState;

    } catch (error) {
      console.error('\n❌ RAG Agent 执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 交互式对话模式
   */
  async chat(questions) {
    console.log('\n🎯 开始 RAG Agent 对话会话\n');

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      await this.query(question);

      // 在问题之间添加延迟
      if (i < questions.length - 1) {
        console.log('\n⏳ 等待 2 秒...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n✅ 对话会话结束');
  }
}

// 主程序
async function main() {
  try {
    console.log('🎬 初始化 RAG Agent...\n');

    // 创建 RAG Agent
    const ragAgent = new RAGAgent();

    // 测试问题
    const testQuestion = "What was Nike's revenue in 2023?";

    // 运行查询
    await ragAgent.query(testQuestion);

    // 如果需要多轮对话，可以使用 chat 方法
    // const questions = [
    //   "What was Nike's revenue in 2023?",
    //   "What are Nike's main business segments?",
    //   "What were the key challenges Nike faced in 2023?"
    // ];
    // await ragAgent.chat(questions);

  } catch (error) {
    console.error('\n❌ 程序执行失败:', error);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 解决方案:');
      console.log('1. 确保 ChromaDB 正在运行:');
      console.log('   npm run start-db');
      console.log('2. 确保集合 "nike_10k_2023" 已创建并包含数据');
    }

    if (error.message.includes('API')) {
      console.log('\n🔧 解决方案:');
      console.log('1. 检查 .env 文件中的 API 密钥');
      console.log('2. 确保 DEEPSEEK_API_KEY 和 ALIBABA_API_KEY 正确设置');
    }
  }
}

// 运行主程序
main();
