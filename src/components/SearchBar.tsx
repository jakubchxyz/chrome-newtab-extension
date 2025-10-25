import React, { useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Google or type..."
        autoFocus
        className="w-full p-4 text-lg rounded-xl text-black"
      />
    </form>
  )
}
