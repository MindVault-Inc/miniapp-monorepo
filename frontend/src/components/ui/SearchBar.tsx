"use client"

import { useState, ChangeEvent, KeyboardEvent, InputHTMLAttributes, forwardRef } from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'

// Utility function for class names
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ')

// Input component
const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-full border border-teal-600 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

interface SearchBarProps {
  onSearch: (query: string) => void
  className?: string
  placeholder?: string
}

export default function SearchBar({ 
  onSearch, 
  className, 
  placeholder = "Search for tests" 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }

  const handleSearch = () => {
    onSearch(searchQuery);
  }

  const handleClear = () => {
    setSearchQuery('');
  }

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        className="w-full h-12 pl-4 pr-12 bg-white rounded-full border-0 text-gray-600 placeholder:text-gray-400 text-lg font-bold"
      />
      <div className="absolute right-2 top-2 flex items-center space-x-2">
        <button 
          onClick={handleClear} 
          className="h-8 px-2 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
        >
          <FaTimes />
        </button>
        <button 
          onClick={handleSearch} 
          className="h-8 px-4 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <FaSearch />
        </button>
      </div>
    </div>
  )
}

