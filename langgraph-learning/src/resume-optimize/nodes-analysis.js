import { parseResumeTool, analyzeSkillsTool, analyzeProjectsTool } from './tools.js'

/**
 * 分析节点文件
 * 包含简历解析和分析相关的节点
 */

/**
 * 节点 1: 解析简历
 * 从原始文本中提取结构化信息
 */
export async function parseResumeNode(state) {
  console.log('\n' + '='.repeat(60))
  console.log('📋 步骤 1: 解析简历')
  console.log('='.repeat(60))

  try {
    const parsed = await parseResumeTool.invoke({
      resumeText: state.resumeText,
    })

    // 检查是否解析成功
    if (parsed.error) {
      console.error('❌ 解析失败:', parsed.error)
      return { error: parsed.error }
    }

    console.log('✅ 解析成功')
    console.log('  - 姓名:', parsed.personalInfo?.name || '未识别')
    console.log('  - 工作年限:', parsed.personalInfo?.yearsOfExperience || 0, '年')
    console.log('  - 技能数量:', parsed.skills?.length || 0)
    console.log('  - 项目数量:', parsed.projects?.length || 0)

    return { parsedResume: parsed }
  } catch (error) {
    console.error('❌ 解析异常:', error.message)
    return { error: `解析异常: ${error.message}` }
  }
}

/**
 * 节点 2: 分析技能
 * 评估技能与工作年限的匹配度
 */
export async function analyzeSkillsNode(state) {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 步骤 2: 分析专业技能')
  console.log('='.repeat(60))

  try {
    const { skills } = state.parsedResume
    const { yearsOfExperience } = state.parsedResume.personalInfo

    const analysis = await analyzeSkillsTool.invoke({
      skills,
      yearsOfExperience,
    })

    if (analysis.error) {
      return { error: analysis.error }
    }

    console.log('✅ 技能分析完成')
    console.log('  - 综合评分:', analysis.score, '/100')
    console.log('  - 发现问题:', analysis.issues?.length || 0, '个')
    console.log('  - 识别优势:', analysis.strengths?.length || 0, '个')

    return { skillsAnalysis: analysis }
  } catch (error) {
    console.error('❌ 技能分析异常:', error.message)
    return { error: `技能分析异常: ${error.message}` }
  }
}

/**
 * 节点 3: 分析项目经验
 * 评估项目经验的质量和难度
 */
export async function analyzeProjectsNode(state) {
  console.log('\n' + '='.repeat(60))
  console.log('💼 步骤 3: 分析项目经验')
  console.log('='.repeat(60))

  try {
    const { projects } = state.parsedResume
    const { yearsOfExperience } = state.parsedResume.personalInfo

    const analysis = await analyzeProjectsTool.invoke({
      projects,
      yearsOfExperience,
    })

    if (analysis.error) {
      return { error: analysis.error }
    }

    console.log('✅ 项目分析完成')
    console.log('  - 综合评分:', analysis.score, '/100')
    console.log('  - 发现问题:', analysis.issues?.length || 0, '个')
    console.log('  - 识别优势:', analysis.strengths?.length || 0, '个')

    return { projectsAnalysis: analysis }
  } catch (error) {
    console.error('❌ 项目分析异常:', error.message)
    return { error: `项目分析异常: ${error.message}` }
  }
}

