import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * 测试数据库连接
 */
export async function testConnection() {
  try {
    // 执行一个简单的查询来测试连接
    const result = await db.execute(sql`SELECT NOW() as current_time, version() as version`);
    
    console.log('✅ 数据库连接成功！');
    console.log('当前时间:', result[0]?.current_time);
    console.log('PostgreSQL 版本:', result[0]?.version);
    
    return {
      success: true,
      message: '数据库连接成功',
      data: result[0]
    };
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    
    return {
      success: false,
      message: '数据库连接失败',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

