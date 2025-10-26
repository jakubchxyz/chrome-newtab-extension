import React, { useState, useEffect, useRef, useCallback } from 'react'

interface SuggestionItem {
  text: string
  type: 'search' | 'url'
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounced fetch suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(searchQuery)}&hl=en`
      )
      const data = await response.json()

      // Google returns [query, [suggestions], ...]
      const googleSuggestions = data[1] || []

      // Process suggestions
      const processedSuggestions: SuggestionItem[] = googleSuggestions.map((suggestion: string) => ({
        text: suggestion,
        type: 'search' as const
      }))

      // Add URL suggestions for common domains if query looks like a URL
      if (searchQuery.includes('.') && !searchQuery.includes(' ')) {
        const commonDomains = ['com', 'org', 'net', 'io', 'dev', 'app']
        const domain = searchQuery.split('.').pop()?.toLowerCase()
        if (domain && commonDomains.includes(domain)) {
          processedSuggestions.unshift({
            text: searchQuery,
            type: 'url'
          })
        }
      }

      setSuggestions(processedSuggestions.slice(0, 8)) // Limit to 8 suggestions
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    }
  }, [])

  // Debounce suggestions fetch
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query)
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [query, fetchSuggestions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const searchTerm = selectedIndex >= 0 ? suggestions[selectedIndex].text : query
    if (!searchTerm.trim()) return

    // Check if it's a URL
    if (searchTerm.includes('.') && !searchTerm.includes(' ') && !searchTerm.startsWith('http')) {
      window.location.href = `https://${searchTerm}`
    } else {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`
    }

    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault()
          handleSubmit(e)
        }
        break
    }
  }

  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)
    setSelectedIndex(-1)

    if (suggestion.type === 'url') {
      window.location.href = suggestion.text.startsWith('http') ? suggestion.text : `https://${suggestion.text}`
    } else {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(suggestion.text)}`
    }
  }

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <form onSubmit={handleSubmit} className="w-full relative z-20">
      <div className={`transition-all duration-200 ${isFocused ? 'scale-105' : 'scale-100'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 transition-opacity duration-200 group-focus-within:opacity-100" />
        <div className="relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(-1)
              setShowSuggestions(true)
            }}
            onFocus={() => {
              setIsFocused(true)
              if (query.length >= 2) {
                setShowSuggestions(true)
              }
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search Google or type a URL..."
            autoFocus
            className="w-full px-6 py-5 text-lg bg-transparent text-white placeholder-gray-400 outline-none border-none focus:ring-0"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!query.trim()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-[200]"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-6 py-3 text-left hover:bg-gray-700/50 transition-colors duration-150 flex items-center gap-3 ${
                  index === selectedIndex ? 'bg-gray-700/70' : ''
                }`}
              >
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {suggestion.type === 'url' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  )}
                </svg>
                <span className="text-gray-200 truncate">{suggestion.text}</span>
                {suggestion.type === 'url' && (
                  <span className="text-xs text-blue-400 ml-auto">URL</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  )
}
