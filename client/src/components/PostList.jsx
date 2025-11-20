import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'

export default function PostList() {
  const { posts, loadPosts, loading, error } = usePosts()

  useEffect(() => {
    loadPosts()
  }, [])

  return (
    <div>
      <h2>Posts</h2>
      {loading && <p>Loading posts...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {posts && posts.length === 0 && !loading && <li>No posts yet</li>}
        {posts && posts.map((p) => (
          <li key={p._id} style={{ marginBottom: 12 }}>
            <Link to={`/posts/${p._id}`}>{p.title}</Link>
            <div style={{ fontSize: 12, color: '#666' }}>{p.excerpt || p.content?.slice(0, 120)}</div>
            <div>
              <Link to={`/posts/${p._id}/edit`} style={{ marginRight: 8 }}>Edit</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
