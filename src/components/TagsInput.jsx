import { useState, useRef } from 'react'

export default function TagsInput({ tags, onChange }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const commitInput = (raw) => {
    const tag = raw.trim()
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitInput(input)
    } else if (e.key === ' ') {
      if (input.trim()) {
        e.preventDefault()
        commitInput(input)
      }
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const handleChange = (e) => {
    const val = e.target.value
    // Split on commas or whitespace (handles paste with separators)
    if (val.includes(',') || val.includes(' ')) {
      const parts = val.split(/[,\s]+/)
      const trailing = val.match(/[,\s]$/) ? '' : (parts.pop() || '')
      const newTags = parts.filter(t => t && !tags.includes(t))
      if (newTags.length) onChange([...tags, ...newTags])
      setInput(trailing)
    } else {
      setInput(val)
    }
  }

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag))

  return (
    <div
      className="tags-input-container"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map(tag => (
        <span key={tag} className="tag-chip">
          {tag}
          <button
            type="button"
            className="tag-chip-remove"
            onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
            aria-label={`Remove tag ${tag}`}
          >×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        className="tags-text-input"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? 'add tags…' : ''}
        aria-label="Add tag"
      />
    </div>
  )
}
