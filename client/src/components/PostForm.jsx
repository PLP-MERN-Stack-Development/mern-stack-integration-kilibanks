import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePosts } from '../context/PostsContext'

export default function PostForm({ editMode = false }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const { createPost, updatePost, getPost, loading } = usePosts()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (editMode && id) {
      getPost(id).then((p) => {
        if (p) {
          setTitle(p.title || '')
          setContent(p.content || '')
          setExcerpt(p.excerpt || '')
          setCategory(p.category?.name || '')
        }
      })
    }
  }, [editMode, id])

  const validate = () => {
    if (!title.trim()) return 'Title is required'
    if (!content.trim()) return 'Content is required'
    return null
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const v = validate()
    if (v) return setError(v)

    const payload = { title, content, excerpt, category }
    try {
      if (editMode && id) {
        const updated = await updatePost(id, payload)
        navigate(`/posts/${updated._id}`)
      } else {
        const created = await createPost(payload)
        navigate(`/posts/${created._id}`)
      }
    } catch (err) {
      setError(err.message || 'Save failed')
    }
  }

  return (
    <div>
      <h2>{editMode ? 'Edit Post' : 'New Post'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <div>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label>Excerpt</label>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div>
          <label>Category (name)</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div>
          <label>Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
