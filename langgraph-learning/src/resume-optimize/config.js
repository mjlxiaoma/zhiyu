import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'

/**
 * 配置文件
 * 包含 LLM 配置和评分阈值
 */

// ==================== LLM 配置 ====================

export const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
  temperature: 0.7,
})

// ==================== 评分阈值 ====================

export const SCORE_THRESHOLDS = {
  EXCELLENT: 85, // 优秀 ⭐⭐⭐
  GOOD: 70, // 良好 ⭐⭐
  NEEDS_IMPROVEMENT: 50, // 需改进 ⚠️
}

// ==================== 评分权重 ====================

export const SCORE_WEIGHTS = {
  SKILLS: 0.4, // 技能权重 40%
  PROJECTS: 0.6, // 项目权重 60%
}
