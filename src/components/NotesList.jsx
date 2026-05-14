import { useState } from 'react'
import { useApp } from '../AppContext.jsx'
import { ConfirmDialog } from './Dialogs.jsx'

export default function NotesList() {
  const {
    currentNotes,
    selectedNote,
    selectNote,
    newNote,
    removeNote,
    listCollapsed, setListCollapsed,
    rootHandle,
  } = useApp()

  const [query, setQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // note item to delete

  const filtered = query.trim()
    ? currentNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.preview.toLowerCase().includes(query.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : currentNotes

  const handleDelete = async () => {
    const note = confirmDelete
    setConfirmDelete(null)
    await removeNote(note)
  }

  return (
    <>
      <aside
        className={`notes-list ${listCollapsed ? 'collapsed' : ''}`}
        aria-label="Notes list"
        onClick={listCollapsed ? () => setListCollapsed(false) : undefined}
      >
        <div className="list-inner">
          <div className="list-toolbar">
            {!listCollapsed && (
              <div className="search-wrap">
                <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search notes…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search notes"
                />
              </div>
            )}
            {rootHandle && (
              <button
                className="new-note-btn"
                onClick={newNote}
                title="New note"
                aria-label="New note"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {!listCollapsed && (
            <ul className="notes-ul" role="listbox" aria-label="Notes">
              {filtered.length === 0 && (
                <li className="notes-empty">
                  {rootHandle ? 'No notes here yet.' : 'Open your folder to get started.'}
                </li>
              )}
              {filtered.map((note) => {
                const isActive = selectedNote?.fileName === note.fileName &&
                  selectedNote?.fileHandle === note.fileHandle
                return (
                  <li key={note.fileName + note.modifiedAt} className="note-item-li">
                    <button
                      className={`note-item ${isActive ? 'active' : ''}`}
                      onClick={() => selectNote(note)}
                      role="option"
                      aria-selected={isActive}
                    >
                      <div className="note-item-title">{note.title}</div>
                      <div className="note-item-meta">
                        <span className="note-item-date">{note.date}</span>
                        {note.tags.length > 0 && (
                          <span className="note-item-tags">
                            {note.tags.slice(0, 2).map((t) => (
                              <span key={t} className="tag-chip">{t}</span>
                            ))}
                          </span>
                        )}
                      </div>
                      {note.preview && (
                        <div className="note-item-preview">{note.preview}</div>
                      )}
                    </button>
                    <button
                      className="note-delete-btn"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(note) }}
                      title="Delete note"
                      aria-label={`Delete ${note.title}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <button
          className="collapse-toggle list-toggle"
          onClick={(e) => { e.stopPropagation(); setListCollapsed((v) => !v) }}
          aria-label={listCollapsed ? 'Expand notes list' : 'Collapse notes list'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"
            style={{ transform: listCollapsed ? 'rotate(180deg)' : 'none' }}>
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
          </svg>
        </button>
      </aside>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}
