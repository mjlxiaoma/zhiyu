import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { llm } from './config.js'
import {
  getParseResumePrompt,
  getAnalyzeSkillsPrompt,
  getAnalyzeProjectsPrompt,
} from './prompts.js'

/**
 * 工具定义文件
 * 包含三个核心工具：解析简历、分析技能、分析项目
 */

/**
 * 辅助函数：解析 LLM 返回的 JSON
 */
function parseJSONResponse(content) {
  try {
    // 尝试提取 JSON 内容
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(content)
  } catch (error) {
    console.error('JSON 解析失败:', error)
    return null
  }
}

/**
 * Tool 1: 解析简历
 * 从文本中提取结构化信息（个人信息、专业技能、项目经验）
 */
export const parseResumeTool = tool(
  async ({ resumeText }) => {
    const prompt = getParseResumePrompt(resumeText)
    const response = await llm.invoke(prompt)
    const parsed = parseJSONResponse(response.content)

    if (!parsed) {
      return { error: '简历解析失败，请检查格式' }
    }

    return parsed
  },
  {
    name: 'parse_resume',
    description: '解析简历文本，提取个人信息、专业技能和项目经验',
    schema: z.object({
      resumeText: z.string().describe('简历文本内容'),
    }),
  }
)

/**
 * Tool 2: 分析技能匹配度
 * 评估技能的深度、广度是否与工作年限相匹配
 */
export const analyzeSkillsTool = tool(
  async ({ skills, yearsOfExperience }) => {
    const prompt = getAnalyzeSkillsPrompt(skills, yearsOfExperience)
    const response = await llm.invoke(prompt)
    const analysis = parseJSONResponse(response.content)

    if (!analysis) {
      return { error: '技能分析失败' }
    }

    return analysis
  },
  {
    name: 'analyze_skills',
    description: '分析专业技能的深度、广度是否与工作年限相匹配',
    schema: z.object({
      skills: z.array(z.string()).describe('技能列表'),
      yearsOfExperience: z.number().describe('工作年限'),
    }),
  }
)

/**
 * Tool 3: 分析项目经验匹配度
 * 评估项目经验的内容、难度是否与工作年限相匹配
 */
export const analyzeProjectsTool = tool(
  async ({ projects, yearsOfExperience }) => {
    const prompt = getAnalyzeProjectsPrompt(projects, yearsOfExperience)
    const response = await llm.invoke(prompt)
    const analysis = parseJSONResponse(response.content)

    if (!analysis) {
      return { error: '项目分析失败' }
    }

    return analysis
  },
  {
    name: 'analyze_projects',
    description: '分析项目经验的内容、难度是否与工作年限相匹配',
    schema: z.object({
      projects: z.array(z.any()).describe('项目列表'),
      yearsOfExperience: z.number().describe('工作年限'),
    }),
  }
)
