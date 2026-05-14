import { useState } from 'react'
import { useApp } from '../AppContext.jsx'
import { InlineInput, ConfirmDialog } from './Dialogs.jsx'
import { slugify } from '../utils/markdown.js'

const PersonIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z"/>
  </svg>
)
const BriefcaseIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M20 6h-2.18c.07-.44.18-.88.18-1.33C18 2.99 16.35 1 14.15 1c-1.33 0-2.43.7-3.15 1.8L10 4.43l-1-1.63C8.28 1.7 7.18 1 5.85 1 3.65 1 2 2.99 2 4.67c0 .45.11.89.18 1.33H0v14a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/>
  </svg>
)
const BookIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
  </svg>
)

const NOTEBOOK_CONFIG = {
  personal: { label: 'Personal', color: '#1a3a5c', accent: '#4a7fb5', icon: PersonIcon },
  work:     { label: 'Work',     color: '#1a3d1a', accent: '#4a8f4a', icon: BriefcaseIcon },
}

// Palette for custom notebooks — cycles if there are more than 6
const CUSTOM_PALETTE = [
  { color: '#4a1a5c', accent: '#8b5cf6' }, // purple
  { color: '#1a3d4a', accent: '#0ea5e9' }, // teal
  { color: '#4a2a1a', accent: '#f97316' }, // orange
  { color: '#1a4a2a', accent: '#22c55e' }, // green
  { color: '#4a1a2a', accent: '#f43f5e' }, // rose
  { color: '#3a3a1a', accent: '#eab308' }, // gold
]

function notebookCfg(name, index = 0) {
  if (NOTEBOOK_CONFIG[name]) return NOTEBOOK_CONFIG[name]
  const palette = CUSTOM_PALETTE[index % CUSTOM_PALETTE.length]
  return {
    label: name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    color: palette.color,
    accent: palette.accent,
    icon: BookIcon,
  }
}

const PencilIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

export default function NotebookShelf() {
  const {
    notebooks,
    selectedNotebook, setSelectedNotebook,
    setSelectedSubject, setSelectedNote,
    shelfCollapsed, setShelfCollapsed,
    rootHandle, openFolder, loading,
    removeNotebook, addNotebook, doRenameNotebook,
    setSettingsOpen,
  } = useApp()

  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [renaming, setRenaming] = useState(null) // notebook name being renamed

  const selectNotebook = (name) => {
    setSelectedNotebook(name)
    const nb = notebooks.find((n) => n.name === name)
    if (nb?.subjects.length) setSelectedSubject(nb.subjects[0].name)
    else setSelectedSubject(null)
    setSelectedNote(null)
  }

  const handleCreate = async (slug) => {
    setAdding(false)
    await addNotebook(slug)
  }

  const handleDelete = async () => {
    const name = confirmDelete
    setConfirmDelete(null)
    await removeNotebook(name)
  }

  const handleRename = async (newName) => {
    const old = renaming
    setRenaming(null)
    if (newName && newName !== old) await doRenameNotebook(old, newName)
  }

  return (
    <>
      <aside
        className={`notebook-shelf ${shelfCollapsed ? 'collapsed' : ''}`}
        aria-label="Notebook shelf"
        onClick={shelfCollapsed ? () => setShelfCollapsed(false) : undefined}
      >
        <div className="shelf-inner">
          {!rootHandle ? (
            <button className="open-folder-btn" onClick={openFolder} disabled={loading} title="Open your five-subject folder">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/>
              </svg>
              {!shelfCollapsed && <span>Open Folder</span>}
            </button>
          ) : (
            <>
              <nav className="notebook-list">
                {notebooks.map((nb, i) => {
                  const cfg = notebookCfg(nb.name, i)
                  const isActive = selectedNotebook === nb.name
                  return (
                    <div key={nb.name} className="notebook-btn-wrap">
                      {renaming === nb.name ? (
                        <div className="notebook-rename-wrap">
                          <InlineInput
                            placeholder={nb.name}
                            onConfirm={handleRename}
                            onCancel={() => setRenaming(null)}
                          />
                        </div>
                      ) : (
                        <button
                          className={`notebook-btn ${isActive ? 'active' : ''}`}
                          style={{ '--nb-color': cfg.color, '--nb-accent': cfg.accent }}
                          onClick={() => selectNotebook(nb.name)}
                          title={cfg.label}
                          aria-pressed={isActive}
                        >
                          <span className="nb-icon">{cfg.icon}</span>
                          {!shelfCollapsed && <span className="nb-label">{cfg.label}</span>}
                        </button>
                      )}
                      {!shelfCollapsed && renaming !== nb.name && (
                        <div className="item-action-btns">
                          <button
                            className="item-action-btn rename-btn"
                            onClick={(e) => { e.stopPropagation(); setRenaming(nb.name) }}
                            title="Rename notebook"
                          >{PencilIcon}</button>
                          <button
                            className="item-action-btn delete-btn"
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(nb.name) }}
                            title="Delete notebook"
                          >✕</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>

              {!shelfCollapsed && (
                adding ? (
                  <InlineInput placeholder="notebook-name" onConfirm={handleCreate} onCancel={() => setAdding(false)} />
                ) : (
                  <button className="add-item-btn" onClick={() => setAdding(true)} title="Add notebook">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add notebook
                  </button>
                )
              )}
            </>
          )}
        </div>

        <button
          className="settings-btn shelf-settings-btn"
          onClick={(e) => { e.stopPropagation(); setSettingsOpen((v) => !v) }}
          title="Settings"
          aria-label="Settings"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        <button
          className="settings-btn shelf-refresh-btn"
          onClick={() => window.location.reload()}
          title="Refresh app"
          aria-label="Refresh app"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>

        <button
          className="collapse-toggle shelf-toggle"
          onClick={(e) => { e.stopPropagation(); setShelfCollapsed((v) => !v) }}
          aria-label={shelfCollapsed ? 'Expand shelf' : 'Collapse shelf'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"
            style={{ transform: shelfCollapsed ? 'rotate(180deg)' : 'none' }}>
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
          </svg>
        </button>
      </aside>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete the "${notebookCfg(confirmDelete, notebooks.findIndex(n => n.name === confirmDelete)).label}" notebook and all its notes? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}
