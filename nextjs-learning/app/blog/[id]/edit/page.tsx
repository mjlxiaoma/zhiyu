import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { blog } from '@/lib/schema'

import EditBlogForm from './edit-form'

type EditBlogPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params

  const [targetBlog] = await db
    .select({
      id: blog.id,
      title: blog.title,
      content: blog.content,
    })
    .from(blog)
    .where(eq(blog.id, id))
    .limit(1)

  if (!targetBlog) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">编辑博客</h1>
        <p className="text-sm text-gray-500">修改标题与内容后提交保存。</p>
      </div>
      <EditBlogForm
        blogId={targetBlog.id}
        initialTitle={targetBlog.title}
        initialContent={targetBlog.content}
      />
    </div>
  )
}


