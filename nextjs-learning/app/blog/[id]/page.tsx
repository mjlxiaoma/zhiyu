import ThumbUpButton from "../thumb-up"

type BlogDetailPrpos = {
  params: Promise<{
    id: string
  }>
}

export default async function BlogDetail({ params }: BlogDetailPrpos) {
  const { id } = await params

  return (
    <div>
      <h2>blog</h2>
      <p>this is a mock {id}</p>
      <ThumbUpButton id={id} />
    </div>
  )
}
