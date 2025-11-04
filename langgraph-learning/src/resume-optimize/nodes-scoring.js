import { llm, SCORE_THRESHOLDS, SCORE_WEIGHTS } from './config.js'
import { getGenerateSuggestionsPrompt } from './prompts.js'

/**
 * 评分和建议节点文件
 * 包含评分计算、建议生成和人工审核节点
 */

/**
 * 节点 4: 计算综合评分
 * 根据技能和项目评分计算总分，判断是否需要人工审核
 */
export async function calculateScoreNode(state) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 步骤 4: 计算综合评分')
  console.log('='.repeat(60))

  const { skillsAnalysis, projectsAnalysis } = state

  // 计算加权平均分
  const overallScore = Math.round(
    skillsAnalysis.score * SCORE_WEIGHTS.SKILLS +
      projectsAnalysis.score * SCORE_WEIGHTS.PROJECTS
  )

  // 判断是否需要人工审核
  const needsHumanReview = overallScore < SCORE_THRESHOLDS.NEEDS_IMPROVEMENT

  // 获取评级
  const getRating = (score) => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return '优秀 ⭐⭐⭐'
    if (score >= SCORE_THRESHOLDS.GOOD) return '良好 ⭐⭐'
    if (score >= SCORE_THRESHOLDS.NEEDS_IMPROVEMENT) return '及格 ⭐'
    return '需改进 ⚠️'
  }

  console.log('✅ 评分计算完成')
  console.log('  - 技能评分:', skillsAnalysis.score, '/100 (权重 40%)')
  console.log('  - 项目评分:', projectsAnalysis.score, '/100 (权重 60%)')
  console.log('  - 综合评分:', overallScore, '/100')
  console.log('  - 评级:', getRating(overallScore))
  console.log('  - 需要人工审核:', needsHumanReview ? '是 ⚠️' : '否')

  return { overallScore, needsHumanReview }
}

/**
 * 节点 5: 生成自动建议
 * AI 自动生成优化建议
 */
export async function generateSuggestionsNode(state) {
  console.log('\n' + '='.repeat(60))
  console.log('💡 步骤 5: 生成优化建议')
  console.log('='.repeat(60))

  try {
    const { parsedResume, skillsAnalysis, projectsAnalysis, overallScore } =
      state

    const prompt = getGenerateSuggestionsPrompt(
      parsedResume,
      skillsAnalysis,
      projectsAnalysis,
      overallScore
    )

    const response = await llm.invoke(prompt)
    const suggestions = response.content

    console.log('✅ 建议生成完成')
    console.log('  - 建议长度:', suggestions.length, '字符')

    return { suggestions }
  } catch (error) {
    console.error('❌ 建议生成异常:', error.message)
    return { error: `建议生成异常: ${error.message}` }
  }
}

/**
 * 节点 6: 人工审核节点
 * 当评分较低时，标记为需要人工审核
 */
export async function humanReviewNode(state) {
  console.log('\n' + '='.repeat(60))
  console.log('👤 步骤 6: 人工审核')
  console.log('='.repeat(60))

  const { overallScore, parsedResume } = state

  console.log('⚠️  此简历评分较低，建议人工审核')
  console.log('  - 候选人:', parsedResume.personalInfo.name)
  console.log('  - 综合评分:', overallScore, '/100')
  console.log('  - 建议: 请 HR 或资深面试官进一步评估')

  // 在实际应用中，这里可以：
  // 1. 发送通知给 HR
  // 2. 将简历添加到待审核队列
  // 3. 生成更详细的审核报告

  const warningMessage =
    '\n\n⚠️ 重要提示：此简历综合评分较低，建议进行人工审核以获得更准确的评估。'

  return {
    suggestions: state.suggestions + warningMessage,
  }
}

