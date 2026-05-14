import { useEffect, useRef } from 'react'
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import { mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Toolbar from './Toolbar.jsx'
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
    pushToGithub,
    pushStatus,
    githubSettings,
    setSettingsOpen,
    updateFrontmatter,
    rootHandle,
    openFolder,
  } = useApp()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({ openOnClick: false }),
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
          <h1 className="welcome-title">Five Subject</h1>
          <p className="welcome-sub">Your notes, your files — no cloud required.</p>
          <button className="welcome-open-btn" onClick={openFolder}>
            Open Folder
          </button>
          <p className="welcome-hint">
            Select your <code>five-subject</code> folder to get started.
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
          <input
            className="meta-tags"
            value={(frontmatter?.tags || []).join(', ')}
            onChange={(e) =>
              updateFrontmatter('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))
            }
            placeholder="tags, comma, separated"
            aria-label="Note tags"
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
        <button
          className={`github-btn ${pushStatus ? 'push-' + pushStatus.split(':')[0] : ''}`}
          onClick={pushToGithub}
          disabled={pushStatus === 'pushing'}
          title={!githubSettings.token ? 'Configure GitHub in Settings first' : 'Push all notes to GitHub'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/>
          </svg>
          {pushStatus === 'pushing' ? 'Pushing…'
            : pushStatus === 'done' ? '✓ Pushed!'
            : pushStatus?.startsWith('error') ? '✕ Failed'
            : 'Push to GitHub'}
        </button>
        <button
          className="settings-btn"
          onClick={() => setSettingsOpen((v) => !v)}
          title="Settings"
          aria-label="Settings"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </footer>
    </main>
  )
}
