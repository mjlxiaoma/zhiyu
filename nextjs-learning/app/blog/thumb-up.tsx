'use client'
export default function ThumbUpButton({ id }: { id: string }) {
  async function handleThumb() {
    const res = await fetch(`/api/blog/thumb-up/${id}`, {
      method: 'POST',
    })
    const data = await res.json()
    alert(JSON.stringify(data))
  }
  return (
    <button onClick={handleThumb}>ThumbButton</button>
  )
}
