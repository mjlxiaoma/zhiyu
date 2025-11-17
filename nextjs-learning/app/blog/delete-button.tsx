'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type DeleteBlogButtonProps = {
  blogId: string
}

export default function DeleteBlogButton({ blogId }: DeleteBlogButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (isPending || isDeleting) return

    const confirmed = window.confirm('确定要删除这篇博客吗？此操作不可恢复。')
    if (!confirmed) return

    setError(null)
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/blog/${blogId}`, {
        method: 'DELETE',
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.errno !== 0) {
        throw new Error(data?.message ?? '删除失败，请稍后重试。')
      }

      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败，请稍后重试。')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div style={{ textAlign: 'right' }}>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting || isPending}
        style={{
          padding: '0.35rem 0.75rem',
          borderRadius: '0.375rem',
          border: '1px solid #ef4444',
          backgroundColor: isDeleting || isPending ? '#fee2e2' : '#fff',
          color: '#b91c1c',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: isDeleting || isPending ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.2s ease',
        }}
      >
        {isDeleting || isPending ? '删除中…' : '删除'}
      </button>
      {error ? (
        <p style={{ color: '#b91c1c', fontSize: '0.75rem', marginTop: '0.25rem' }}>{error}</p>
      ) : null}
    </div>
  )
}


