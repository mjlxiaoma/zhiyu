'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type EditBlogFormProps = {
  blogId: string
  initialTitle: string
  initialContent: string
}

export default function EditBlogForm({
  blogId,
  initialTitle,
  initialContent,
}: EditBlogFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/blog/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.errno !== 0) {
        throw new Error(data?.message ?? '更新失败，请稍后重试。')
      }

      setSuccess('更新成功，正在跳转…')
      router.push(`/blog/${blogId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败，请稍后重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          标题
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          required
        />
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中…' : '保存修改'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          取消
        </button>
      </div>
    </form>
  )
}


