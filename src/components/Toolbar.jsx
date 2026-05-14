import { useRef } from 'react'

export default function Toolbar({ editor }) {
  if (!editor) return null

  const imageInputRef = useRef(null)

  const handleImageFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => editor.chain().focus().setImage({ src: reader.result }).run()
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const btn = (label, action, isActive, title) => (
    <button
      key={label}
      className={`tb-btn ${isActive ? 'active' : ''}`}
      onMouseDown={(e) => { e.preventDefault(); action() }}
      title={title || label}
      aria-label={title || label}
      aria-pressed={isActive}
    >
      {label}
    </button>
  )

  const divider = (key) => <span key={key} className="tb-divider" />

  return (
    <div className="toolbar" role="toolbar" aria-label="Editor toolbar">
      {btn('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        editor.isActive('heading', { level: 1 }), 'Heading 1')}
      {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        editor.isActive('heading', { level: 2 }), 'Heading 2')}
      {btn('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        editor.isActive('heading', { level: 3 }), 'Heading 3')}

      {divider('d1')}

      <button
        className={`tb-btn ${editor.isActive('bold') ? 'active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
        title="Bold (Ctrl+B)" aria-label="Bold" aria-pressed={editor.isActive('bold')}
      >
        <strong>B</strong>
      </button>
      <button
        className={`tb-btn ${editor.isActive('italic') ? 'active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
        title="Italic (Ctrl+I)" aria-label="Italic" aria-pressed={editor.isActive('italic')}
      >
        <em>I</em>
      </button>
      <button
        className={`tb-btn ${editor.isActive('underline') ? 'active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}
        title="Underline (Ctrl+U)" aria-label="Underline" aria-pressed={editor.isActive('underline')}
      >
        <u>U</u>
      </button>
      <button
        className={`tb-btn ${editor.isActive('highlight') ? 'active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHighlight().run() }}
        title="Highlight" aria-label="Highlight" aria-pressed={editor.isActive('highlight')}
        style={{ background: editor.isActive('highlight') ? '#fef08a' : '', color: '#000' }}
      >
        <span style={{ background: '#fef08a', padding: '0 3px', borderRadius: '2px' }}>H</span>
      </button>

      <button
        className={`tb-btn ${editor.isActive('strike') ? 'active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run() }}
        title="Strikethrough" aria-label="Strikethrough" aria-pressed={editor.isActive('strike')}
      >
        <s>S</s>
      </button>

      {divider('d2')}

      <button
        className={`tb-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
        title="Bullet list" aria-label="Bullet list"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
          <path d="M9 5h11M9 12h11M9 19h11M4 5v.01M4 12v.01M4 19v.01" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </button>
      <button
        className={`tb-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}
        title="Ordered list" aria-label="Ordered list"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
          <path d="M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <text x="2" y="7" fontSize="5" fill="currentColor">1</text>
        </svg>
      </button>

      {divider('d3')}

      <button
        className="tb-btn"
        onMouseDown={(e) => {
          e.preventDefault()
          const url = window.prompt('Link URL:')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }}
        title="Insert link" aria-label="Insert link"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" strokeLinecap="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </button>
      <button
        className="tb-btn"
        onMouseDown={(e) => { e.preventDefault(); imageInputRef.current?.click() }}
        title="Insert image from file" aria-label="Insert image"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageFile}
      />
    </div>
  )
}
