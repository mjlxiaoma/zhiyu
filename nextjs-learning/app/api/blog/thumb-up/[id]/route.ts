export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
  const { id } = await params
  console.log('Thumb up for blog:', id)
  return Response.json({
    errno: 0,
    data: { id }
  })
}