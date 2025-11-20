import React from 'react'
import { Link } from 'react-router-dom'

export default function Nav() {
  return (
    <nav style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #ddd' }}>
      <Link to="/" style={{ marginRight: 16 }}>Home</Link>
      <Link to="/posts/new">New Post</Link>
    </nav>
  )
}
