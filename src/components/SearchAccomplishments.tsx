'use client'

import { useState, useCallback } from 'react'
import { debounce } from 'lodash'

interface SearchProps {
  onSearch: (query: string) => void
}

export default function SearchAccomplishments({ onSearch }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Debounce the search with proper dependency
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query)
    }, 300),
    [onSearch]
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchTerm(query)
    debouncedSearch(query)
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search accomplishments..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-10"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}