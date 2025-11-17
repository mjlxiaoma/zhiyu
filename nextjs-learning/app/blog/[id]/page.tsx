import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { blog } from "@/lib/schema"
import { eq } from "drizzle-orm"
import ThumbUpButton from "../thumb-up"

type BlogDetailProps = {
  params: Promise<{
    id: string
  }>
}

export default async function BlogDetail({ params }: BlogDetailProps) {
  const { id } = await params

  const [currentBlog] = await db
    .select({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      updatedAt: blog.updatedAt,
      thumbup: blog.thumbup,
    })
    .from(blog)
    .where(eq(blog.id, id))
    .limit(1)

  if (!currentBlog) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{currentBlog.title}</h2>
          <p className="text-sm text-gray-500">
            最近更新：{currentBlog.updatedAt.toLocaleString()}
          </p>
        </div>
        <Link
          href={`/blog/${currentBlog.id}/edit`}
          className="inline-flex items-center justify-center rounded-md border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
        >
          编辑
        </Link>
      </div>
      <p className="whitespace-pre-wrap leading-7 text-gray-800">
        {currentBlog.content}
      </p>
      <ThumbUpButton id={currentBlog.id} initialThumbup={currentBlog.thumbup} />
    </div>
  )
}