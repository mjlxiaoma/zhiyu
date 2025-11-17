/**
 * 数据库连接测试脚本
 * 运行方式: npx tsx scripts/test-db.ts
 * 或者: npm run test:db (需要在 package.json 中添加脚本)
 */

import 'dotenv/config';
import { testConnection } from '../lib/test-connection';

async function main() {
  console.log('正在测试数据库连接...\n');
  
  const result = await testConnection();
  
  if (result.success) {
    console.log('\n✅ 测试通过！数据库连接正常。');
    process.exit(0);
  } else {
    console.log('\n❌ 测试失败！请检查数据库连接配置。');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('发生未预期的错误:', error);
  process.exit(1);
});

