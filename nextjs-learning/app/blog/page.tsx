import Link from 'next/link'
import { desc } from 'drizzle-orm'

import { db } from '@/lib/db'
import { blog } from '@/lib/schema'
import DeleteBlogButton from './delete-button'

export default async function BlogPage() {
  const posts = await db
    .select({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      createdAt: blog.createdAt,
    })
    .from(blog)
    .orderBy(desc(blog.createdAt))

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>博客</h1>
        <Link
          href="/blog/new"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          新建博客
        </Link>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: '#6b7280' }}>暂无博客，点击右上角按钮新建一篇吧。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {posts.map((post) => (
            <li
              key={post.id}
              style={{
                paddingBottom: '1.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0 }}>
                    <Link
                      href={`/blog/${post.id}`}
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        color: '#111827',
                      }}
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <time
                    dateTime={post.createdAt?.toISOString()}
                    style={{ display: 'block', color: '#6b7280', marginTop: '0.25rem' }}
                  >
                    {formatDate(post.createdAt)}
                  </time>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link
                    href={`/blog/${post.id}/edit`}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #2563eb',
                      backgroundColor: '#fff',
                      color: '#2563eb',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    编辑
                  </Link>
                  <DeleteBlogButton blogId={post.id} />
                </div>
              </div>
              <p style={{ marginTop: '0.75rem', color: '#374151', lineHeight: 1.6 }}>
                {post.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatDate(date?: Date | null) {
  if (!date) return '未知时间'

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  } catch {
    return date.toISOString()
  }
}
