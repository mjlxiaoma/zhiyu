import { MemorySaver } from '@langchain/langgraph'
import { StateGraph, START, END } from '@langchain/langgraph'
import { ResumeState } from './state.js'
import {
  parseResumeNode,
  analyzeSkillsNode,
  analyzeProjectsNode,
} from './nodes-analysis.js'
import {
  calculateScoreNode,
  generateSuggestionsNode,
  humanReviewNode,
} from './nodes-scoring.js'

/**
 * 工作流构建文件
 * 定义 LangGraph 工作流的结构和路由逻辑
 */

// ==================== 条件路由函数 ====================

/**
 * 条件路由：检查是否有错误
 */
function checkParseSuccess(state) {
  if (state.error) {
    console.log('⚠️  检测到错误，终止流程')
    return 'end'
  }
  return 'continue'
}

/**
 * 条件路由：决定是否需要人工审核
 */
function shouldHumanReview(state) {
  if (state.error) {
    return 'end'
  }
  if (state.needsHumanReview) {
    console.log('🔀 路由决策: 需要人工审核')
    return 'humanReview'
  }
  console.log('🔀 路由决策: 自动生成建议')
  return 'autoSuggestions'
}

// ==================== 构建工作流图 ====================

/**
 * 创建简历优化工作流
 */
function createWorkflow() {
  const workflow = new StateGraph(ResumeState)
    // 添加所有节点
    .addNode('parse', parseResumeNode)
    .addNode('analyzeSkills', analyzeSkillsNode)
    .addNode('analyzeProjects', analyzeProjectsNode)
    .addNode('calculateScore', calculateScoreNode)
    .addNode('generateSuggestions', generateSuggestionsNode)
    .addNode('humanReview', humanReviewNode)

    // 定义流程：START → 解析
    .addEdge(START, 'parse')

    // 解析后：检查是否成功
    .addConditionalEdges('parse', checkParseSuccess, {
      continue: 'analyzeSkills',
      end: END,
    })

    // 分析技能 → 分析项目
    .addEdge('analyzeSkills', 'analyzeProjects')

    // 分析项目 → 计算评分
    .addEdge('analyzeProjects', 'calculateScore')

    // 条件路由：根据评分决定下一步
    .addConditionalEdges('calculateScore', shouldHumanReview, {
      autoSuggestions: 'generateSuggestions',
      humanReview: 'humanReview',
      end: END,
    })

    // 两个分支都结束
    .addEdge('generateSuggestions', END)
    .addEdge('humanReview', END)

  // 创建持久化存储
  const checkpointer = new MemorySaver()

  // 编译图
  return workflow.compile({ checkpointer })
}

// 导出编译好的工作流应用
export const app = createWorkflow()

/**
 * 优化简历的主函数
 */
export async function optimizeResume(resumeText, config = {}) {
  console.log('🚀 开始优化简历...\n')

  const result = await app.invoke({ resumeText }, config)

  console.log('\n' + '='.repeat(60))
  console.log('✨ 简历优化完成！')
  console.log('='.repeat(60))

  return {
    parsedResume: result.parsedResume,
    skillsAnalysis: result.skillsAnalysis,
    projectsAnalysis: result.projectsAnalysis,
    overallScore: result.overallScore,
    needsHumanReview: result.needsHumanReview,
    suggestions: result.suggestions,
    error: result.error,
  }
}
