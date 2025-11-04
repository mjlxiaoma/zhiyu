import { optimizeResume } from './workflow.js'

/**
 * 简历优化 Agent - 入口文件
 * 
 * 功能：
 * 1. 解析简历（提取个人信息、专业技能、项目经验）
 * 2. 分析技能与工作年限的匹配度
 * 3. 分析项目经验的质量和难度
 * 4. 计算综合评分
 * 5. 生成优化建议（低分简历会标记为需要人工审核）
 */

// ==================== 示例简历 ====================

const sampleResume = `
张三
前端工程师 | 3年工作经验
联系方式：zhangsan@example.com

专业技能：
- HTML、CSS、JavaScript
- Vue.js、React
- Node.js
- Git

项目经验：
1. 电商平台前端开发
   负责公司电商平台的前端页面开发，使用Vue.js实现商品展示、购物车等功能。
   项目时长：6个月

2. 移动端H5活动页
   开发各类营销活动页面，使用原生JavaScript和CSS3实现动画效果。
   项目时长：3个月
`

// ==================== 运行示例 ====================

/**
 * 主函数：运行简历优化
 */
async function main() {
  try {
    // 配置（可选）：用于状态持久化
    const config = {
      configurable: {
        thread_id: 'resume-1', // 每个简历一个唯一 ID
      },
    }

    // 执行优化
    const result = await optimizeResume(sampleResume, config)

    // 打印结果摘要
    console.log('\n📊 最终结果摘要:')
    console.log('='.repeat(60))

    if (result.error) {
      console.log('❌ 错误:', result.error)
    } else {
      console.log('✅ 候选人:', result.parsedResume?.personalInfo?.name)
      console.log('📈 技能评分:', result.skillsAnalysis?.score || 'N/A', '/100')
      console.log('💼 项目评分:', result.projectsAnalysis?.score || 'N/A', '/100')
      console.log('🎯 综合评分:', result.overallScore, '/100')
      console.log('⚠️  需要人工审核:', result.needsHumanReview ? '是' : '否')

      console.log('\n📝 优化建议:')
      console.log('='.repeat(60))
      console.log(result.suggestions)
    }
  } catch (error) {
    console.error('❌ 运行错误:', error)
  }
}

// 运行主函数
main()

