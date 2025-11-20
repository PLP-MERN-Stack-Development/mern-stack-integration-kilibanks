import React from 'react'
import Nav from './Nav'

export default function Layout({ children }) {
  return (
    <div>
      <Nav />
      <main style={{ padding: '1rem' }}>{children}</main>
    </div>
  )
}
