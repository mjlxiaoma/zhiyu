import { pgTable, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

// 用户表
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  image: text('image'),
  intro: text('intro'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 博客表
export const blog = pgTable('blog', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  thumbup: integer('thumbup').notNull().default(0),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 导出类型
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Blog = typeof blog.$inferSelect;
export type NewBlog = typeof blog.$inferInsert;

