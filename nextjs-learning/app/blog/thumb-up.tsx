'use client'

import { useState } from 'react'

type ThumbUpButtonProps = {
  id: string
  initialThumbup: number
}

export default function ThumbUpButton({ id, initialThumbup }: ThumbUpButtonProps) {
  const [thumbup, setThumbup] = useState(initialThumbup)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleThumb() {
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/blog/thumb-up/${id}`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('点赞请求失败')
      }

      const data = await res.json()

      if (data?.errno !== 0 || !data?.data) {
        throw new Error(data?.message || '点赞失败，请稍后重试')
      }

      setThumbup(data.data.thumbup)
    } catch (err) {
      setError(err instanceof Error ? err.message : '点赞失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleThumb}
        disabled={isSubmitting}
        className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? '点赞中...' : '点赞'}
        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {thumbup}
        </span>
      </button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}
