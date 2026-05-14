import { useState, useRef, useEffect } from 'react'
import { slugify } from '../utils/markdown.js'

// Inline input that appears in place (e.g. "new notebook name")
export function InlineInput({ placeholder = 'Name…', onConfirm, onCancel }) {
  const [value, setValue] = useState('')
  const ref = useRef(null)

  useEffect(() => { ref.current?.focus() }, [])

  const submit = () => {
    const slug = slugify(value)
    if (slug) onConfirm(slug)
  }

  const onKey = (e) => {
    if (e.key === 'Enter') submit()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="inline-input-wrap">
      <input
        ref={ref}
        className="inline-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder}
        spellCheck={false}
      />
      <button className="inline-input-ok" onClick={submit} title="Create">✓</button>
      <button className="inline-input-cancel" onClick={onCancel} title="Cancel">✕</button>
    </div>
  )
}

// Small modal confirmation dialog
export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <>
      <div className="confirm-backdrop" onClick={onCancel} />
      <div className="confirm-dialog" role="alertdialog" aria-modal="true">
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm-ok" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </>
  )
}
