import React, { createContext, useContext, useState } from 'react'
import useApi from '../hooks/useApi'

const PostsContext = createContext()

export function PostsProvider({ children }) {
  const { postService, categoryService } = useApi()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPosts = async (page = 1, limit = 20, category = null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await postService.getAllPosts(page, limit, category)
      const items = res.data ?? res
      setPosts(items)
      return items
    } catch (err) {
      setError(err.message || 'Failed to load posts')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getPost = async (idOrSlug) => {
    setLoading(true)
    setError(null)
    try {
      const res = await postService.getPost(idOrSlug)
      const item = res.data ?? res
      return item
    } catch (err) {
      setError(err.message || 'Failed to load post')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (postData) => {
    // optimistic UI: add temp item
    const tempId = `temp-${Date.now()}`
    const temp = { ...postData, _id: tempId, createdAt: new Date().toISOString() }
    setPosts((s) => [temp, ...s])
    setError(null)
    try {
      const res = await postService.createPost(postData)
      const saved = res.data ?? res
      setPosts((s) => s.map((p) => (p._id === tempId ? saved : p)))
      return saved
    } catch (err) {
      // rollback optimistic
      setPosts((s) => s.filter((p) => p._id !== tempId))
      setError(err.message || 'Create failed')
      throw err
    }
  }

  const updatePost = async (id, update) => {
    setError(null)
    // optimistic update snapshot
    const snapshot = posts
    setPosts((s) => s.map((p) => (p._id === id ? { ...p, ...update } : p)))
    try {
      const res = await postService.updatePost(id, update)
      const saved = res.data ?? res
      setPosts((s) => s.map((p) => (p._id === id ? saved : p)))
      return saved
    } catch (err) {
      setPosts(snapshot)
      setError(err.message || 'Update failed')
      throw err
    }
  }

  const deletePost = async (id) => {
    setError(null)
    const snapshot = posts
    setPosts((s) => s.filter((p) => p._id !== id))
    try {
      const res = await postService.deletePost(id)
      return res
    } catch (err) {
      setPosts(snapshot)
      setError(err.message || 'Delete failed')
      throw err
    }
  }

  const getCategories = async () => {
    try {
      const res = await categoryService.getAllCategories()
      return res.data ?? res
    } catch (err) {
      setError(err.message || 'Failed to load categories')
      throw err
    }
  }

  const createCategory = async (payload) => {
    try {
      const res = await categoryService.createCategory(payload)
      return res.data ?? res
    } catch (err) {
      setError(err.message || 'Create category failed')
      throw err
    }
  }

  return (
    <PostsContext.Provider
      value={{ posts, loading, error, loadPosts, getPost, createPost, updatePost, deletePost, getCategories, createCategory }}
    >
      {children}
    </PostsContext.Provider>
  )
}

export const usePosts = () => useContext(PostsContext)
