import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 从环境变量获取数据库连接字符串
const connectionString = process.env.DB_URL;

if (!connectionString) {
  throw new Error('DB_URL environment variable is not set. Please create a .env file with DB_URL=your_connection_string');
}

// 创建 postgres 客户端
const client = postgres(connectionString);

// 创建 drizzle 实例，传入 schema
export const db = drizzle(client, { schema });

