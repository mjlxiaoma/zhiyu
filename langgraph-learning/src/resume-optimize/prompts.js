/**
 * 提示词模板文件 - 包含所有与 LLM 交互的提示词
 */

/** 简历解析提示词 */
export function getParseResumePrompt(resumeText) {
  return `请分析以下简历文本，提取出以下三个部分的信息：

简历文本：
${resumeText}

请按照以下JSON格式返回结果：
{
  "personalInfo": {
    "name": "姓名",
    "yearsOfExperience": 工作年限(数字),
    "position": "当前职位",
    "contact": "联系方式"
  },
  "skills": ["技能1", "技能2", ...],
  "projects": [
    {
      "name": "项目名称",
      "description": "项目描述",
      "technologies": ["技术1", "技术2"],
      "duration": "项目时长"
    }
  ]
}

只返回JSON，不要其他说明。`
}

/** 技能分析提示词 */
export function getAnalyzeSkillsPrompt(skills, yearsOfExperience) {
  return `请分析以下程序员的专业技能是否与工作年限相匹配：

工作年限：${yearsOfExperience} 年
专业技能：${skills.join(', ')}

请从以下几个维度进行分析：
1. 技能广度：技能数量和多样性是否合理
2. 技能深度：是否有深入掌握的技术栈
3. 技能层次：是否涵盖了基础、进阶和高级技能
4. 与年限匹配度：${yearsOfExperience}年经验应该掌握哪些技能

请按照以下JSON格式返回分析结果：
{
  "score": 0-100的评分,
  "breadth": "广度评价",
  "depth": "深度评价",
  "matching": "与工作年限匹配度评价",
  "issues": ["问题1", "问题2", ...],
  "strengths": ["优势1", "优势2", ...]
}

只返回JSON，不要其他说明。`
}

/** 项目分析提示词 */
export function getAnalyzeProjectsPrompt(projects, yearsOfExperience) {
  const projectsText = projects
    .map((p, i) =>
      `${i + 1}. ${p.name}\n   描述：${p.description}\n   技术：${
        p.technologies?.join(', ') || '未提供'
      }\n   时长：${p.duration || '未提供'}`
    )
    .join('\n\n')

  return `请分析以下程序员的项目经验是否与工作年限相匹配：

工作年限：${yearsOfExperience} 年
项目经验：
${projectsText}

请从以下几个维度进行分析：
1. 项目数量：是否与工作年限相符
2. 项目难度：是否体现了技术成长曲线
3. 项目质量：描述是否清晰，是否突出个人贡献
4. 技术栈：项目中使用的技术是否与声称的技能匹配

请按照以下JSON格式返回分析结果：
{
  "score": 0-100的评分,
  "quantity": "数量评价",
  "quality": "质量评价",
  "difficulty": "难度评价",
  "matching": "与工作年限匹配度评价",
  "issues": ["问题1", "问题2", ...],
  "strengths": ["优势1", "优势2", ...]
}

只返回JSON，不要其他说明。`
}

/** 生成建议提示词 */
export function getGenerateSuggestionsPrompt(
  parsedResume,
  skillsAnalysis,
  projectsAnalysis,
  overallScore
) {
  return `基于以下简历分析结果，请生成详细的优化建议：

候选人信息：
- 姓名：${parsedResume.personalInfo.name}
- 工作年限：${parsedResume.personalInfo.yearsOfExperience} 年
- 当前职位：${parsedResume.personalInfo.position}
- 综合评分：${overallScore}/100

技能分析结果：
- 评分：${skillsAnalysis.score}/100
- 广度：${skillsAnalysis.breadth}
- 深度：${skillsAnalysis.depth}
- 匹配度：${skillsAnalysis.matching}
- 问题：${skillsAnalysis.issues?.join('; ') || '无'}
- 优势：${skillsAnalysis.strengths?.join('; ') || '无'}

项目经验分析结果：
- 评分：${projectsAnalysis.score}/100
- 数量：${projectsAnalysis.quantity}
- 质量：${projectsAnalysis.quality}
- 难度：${projectsAnalysis.difficulty}
- 匹配度：${projectsAnalysis.matching}
- 问题：${projectsAnalysis.issues?.join('; ') || '无'}
- 优势：${projectsAnalysis.strengths?.join('; ') || '无'}

请生成一份详细的简历优化建议报告，包括：
1. 总体评价（基于 ${overallScore}/100 的评分）
2. 技能部分的改进建议（针对发现的问题）
3. 项目经验部分的改进建议（如何更好地展示项目价值）
4. 具体的优化步骤（按优先级排序）
5. 推荐的技能补充方向（基于工作年限和当前技能栈）

请用清晰、专业、具有可操作性的语言表达，帮助候选人提升简历竞争力。`
}

