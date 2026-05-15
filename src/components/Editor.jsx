import { useEffect, useRef } from 'react'
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import { mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Toolbar from './Toolbar.jsx'
import TagsInput from './TagsInput.jsx'
import ImageNodeView from './ImageNodeView.jsx'
import { useApp } from '../AppContext.jsx'

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      align: { default: 'left' },
    }
  },
  parseHTML() {
    return [{
      tag: 'img[src]',
      getAttrs: (el) => ({
        src: el.getAttribute('src'),
        alt: el.getAttribute('alt'),
        title: el.getAttribute('title'),
        width: el.getAttribute('width') ? parseInt(el.getAttribute('width')) : null,
        align: el.getAttribute('data-align') || 'left',
      }),
    }]
  },
  renderHTML({ HTMLAttributes }) {
    const { align, width, ...rest } = HTMLAttributes
    return ['img', mergeAttributes(rest, {
      ...(width && { width: String(width) }),
      ...(align && align !== 'left' && { 'data-align': align }),
    })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

export default function Editor() {
  const {
    selectedNote,
    editorHtml,
    onEditorUpdate,
    saveNote,
    isDirty,
    paperStyle,
    updateFrontmatter,
    rootHandle,
    openFolder,
  } = useApp()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      ResizableImage,
    ],
    content: editorHtml,
    onUpdate({ editor }) {
      onEditorUpdate(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        spellcheck: 'true',
      },
    },
  })

  // Sync external content changes into editor
  const lastNoteRef = useRef(null)
  useEffect(() => {
    if (!editor) return
    if (selectedNote?.fileName !== lastNoteRef.current) {
      editor.commands.setContent(editorHtml, false)
      lastNoteRef.current = selectedNote?.fileName || null
    }
  }, [selectedNote, editorHtml, editor])

  // Ctrl+S to save
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveNote()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [saveNote])

  const paperClass = `paper-${paperStyle}`

  if (!rootHandle) {
    return (
      <main className="editor-pane welcome">
        <div className="welcome-content">
          <div className="welcome-logo">
            <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
              <rect x="8" y="4" width="64" height="72" rx="4" fill="#2c1a0e"/>
              <rect x="14" y="10" width="52" height="60" rx="2" fill="#fffef9"/>
              <rect x="8" y="4" width="6" height="72" rx="2" fill="#e8761a"/>
              <line x1="22" y1="26" x2="58" y2="26" stroke="#ccc" strokeWidth="1.5"/>
              <line x1="22" y1="34" x2="58" y2="34" stroke="#ccc" strokeWidth="1.5"/>
              <line x1="22" y1="42" x2="48" y2="42" stroke="#ccc" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1 className="welcome-title">
            Five Subject Notebook App
            <span className="welcome-title-sub">(working title)</span>
          </h1>
          <p className="welcome-sub">Your notes, your files — no cloud required.</p>
          <button className="welcome-open-btn" onClick={openFolder}>
            Open Folder
          </button>
          <p className="welcome-hint">
            Select your notes folder to get started.
            Your existing notes will appear instantly.
          </p>
        </div>
      </main>
    )
  }

  if (!selectedNote) {
    return (
      <main className={`editor-pane ${paperClass} no-note`}>
        <div className="no-note-msg">
          Select a note or create a new one.
        </div>
      </main>
    )
  }

  const { frontmatter } = selectedNote

  return (
    <main className={`editor-pane ${paperClass}`}>
      <div className="editor-header">
        <input
          className="note-title-input"
          value={frontmatter?.title || ''}
          onChange={(e) => updateFrontmatter('title', e.target.value)}
          placeholder="Note title"
          aria-label="Note title"
        />
        <div className="editor-meta">
          <input
            className="meta-date"
            type="date"
            value={frontmatter?.date || ''}
            onChange={(e) => updateFrontmatter('date', e.target.value)}
            aria-label="Note date"
          />
          <TagsInput
            tags={frontmatter?.tags || []}
            onChange={(tags) => updateFrontmatter('tags', tags)}
          />
        </div>
      </div>

      <Toolbar editor={editor} />

      <div className={`editor-scroll ${paperClass}`}>
        <EditorContent editor={editor} />
      </div>

      <footer className="editor-footer">
        <button
          className={`save-btn ${isDirty ? 'dirty' : ''}`}
          onClick={saveNote}
          title="Save (Ctrl+S)"
        >
          {isDirty ? 'Save' : 'Saved'}
        </button>
      </footer>
    </main>
  )
}
