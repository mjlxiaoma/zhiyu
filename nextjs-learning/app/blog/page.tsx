export default function Blog() {
  const posts = [
    { id: 1, title: 'Post 1', content: 'This is the first post' },
    { id: 2, title: 'Post 2', content: 'This is the second post' },
    { id: 3, title: 'Post 3', content: 'This is the third post' },
  ]

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: '1.5rem' }}>
            <h2>
              <a
                href={`/blog/${post.id}`}
                style={{ textDecoration: 'underline', color: 'inherit' }}
              >
                {post.title}
              </a>
            </h2>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
