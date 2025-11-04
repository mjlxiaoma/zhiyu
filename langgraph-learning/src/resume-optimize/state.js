import { Annotation } from '@langchain/langgraph'

/**
 * 状态定义文件
 * 定义工作流中的状态结构
 */

/**
 * 简历优化工作流的状态
 * LangGraph 会在各个节点之间传递这个状态
 */
export const ResumeState = Annotation.Root({
  // 原始简历文本
  resumeText: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),

  // 解析后的简历信息
  parsedResume: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),

  // 技能分析结果
  skillsAnalysis: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),

  // 项目经验分析结果
  projectsAnalysis: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),

  // 综合评分
  overallScore: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),

  // 是否需要人工审核
  needsHumanReview: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),

  // 最终优化建议
  suggestions: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),

  // 错误信息
  error: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
})

