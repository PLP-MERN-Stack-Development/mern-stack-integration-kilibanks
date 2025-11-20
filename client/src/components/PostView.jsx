import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'

export default function PostView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPost, deletePost, loading } = usePosts()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setError(null)
    getPost(id)
      .then((res) => {
        if (mounted) setPost(res)
      })
      .catch((err) => setError(err.message || 'Failed to load'))
    return () => (mounted = false)
  }, [id])

  const onDelete = async () => {
    if (!confirm('Delete this post?')) return
    try {
      await deletePost(id)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  if (loading && !post) return <p>Loading...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!post) return <p>Post not found</p>

  return (
    <article>
      <h2>{post.title}</h2>
      <p style={{ color: '#666' }}>{post.excerpt}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate(`/posts/${id}/edit`)} style={{ marginRight: 8 }}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </article>
  )
}
