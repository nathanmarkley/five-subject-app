import { useState } from 'react'
import { useApp } from '../AppContext.jsx'
import { InlineInput, ConfirmDialog } from './Dialogs.jsx'

const TAB_COLORS = [
  { bg: '#e8761a', text: '#fff' },
  { bg: '#2b6cb0', text: '#fff' },
  { bg: '#276749', text: '#fff' },
  { bg: '#b7950b', text: '#000' },
  { bg: '#6b46c1', text: '#fff' },
]

const SUBJECT_LABELS = {
  'ideas': 'Ideas',
  'my-to-do': 'To-Do',
  'business': 'Business',
  'radio-show': 'Radio Show',
  'misc': 'Misc',
  'show-prep': 'Show Prep',
  'swag': 'Swag',
  'work-to-do': 'To-Do',
  'youth-coordinator-role': 'Youth Coord.',
}

const subjectLabel = (name) =>
  SUBJECT_LABELS[name] || name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const PencilIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

export default function SubjectTabs() {
  const {
    currentNotebook,
    selectedSubject, setSelectedSubject,
    setSelectedNote,
    tabsCollapsed, setTabsCollapsed,
    removeSubject, addSubject, doRenameSubject,
    setMobilePane,
  } = useApp()

  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [renaming, setRenaming] = useState(null) // subject name being renamed

  const subjects = currentNotebook?.subjects || []

  const selectSubject = (name) => {
    setSelectedSubject(name)
    setSelectedNote(null)
    setMobilePane('list')
  }

  const handleCreate = async (slug) => {
    setAdding(false)
    await addSubject(slug)
  }

  const handleDelete = async () => {
    const name = confirmDelete
    setConfirmDelete(null)
    await removeSubject(name)
  }

  const handleRename = async (newName) => {
    const old = renaming
    setRenaming(null)
    if (newName && newName !== old) await doRenameSubject(old, newName)
  }

  return (
    <>
      <aside
        className={`subject-tabs ${tabsCollapsed ? 'collapsed' : ''}`}
        aria-label="Subject tabs"
        onClick={tabsCollapsed ? () => setTabsCollapsed(false) : undefined}
      >
        <div className="tabs-inner">
          {subjects.map((sub, i) => {
            const color = TAB_COLORS[i % TAB_COLORS.length]
            const isActive = selectedSubject === sub.name
            const label = subjectLabel(sub.name)
            return (
              <div key={sub.name} className="tab-btn-wrap">
                {renaming === sub.name ? (
                  <div className="tab-rename-wrap">
                    <InlineInput
                      placeholder={sub.name}
                      onConfirm={handleRename}
                      onCancel={() => setRenaming(null)}
                    />
                  </div>
                ) : (
                  <button
                    className={`subject-tab ${isActive ? 'active' : ''}`}
                    style={{ '--tab-bg': color.bg, '--tab-text': color.text }}
                    onClick={() => selectSubject(sub.name)}
                    title={label}
                    aria-pressed={isActive}
                  >
                    <span className="tab-label">{tabsCollapsed ? label.slice(0, 1) : label}</span>
                    {!tabsCollapsed && <span className="tab-count">{sub.notes.length}</span>}
                  </button>
                )}
                {!tabsCollapsed && renaming !== sub.name && (
                  <div className="item-action-btns tab-action-btns">
                    <button
                      className="item-action-btn rename-btn"
                      onClick={(e) => { e.stopPropagation(); setRenaming(sub.name) }}
                      title="Rename subject"
                    >{PencilIcon}</button>
                    <button
                      className="item-action-btn delete-btn"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(sub.name) }}
                      title="Delete subject"
                    >✕</button>
                  </div>
                )}
              </div>
            )
          })}

          {!tabsCollapsed && currentNotebook && (
            adding ? (
              <InlineInput placeholder="subject-name" onConfirm={handleCreate} onCancel={() => setAdding(false)} />
            ) : (
              <button className="add-item-btn add-item-btn--dark" onClick={() => setAdding(true)} title="Add subject">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add subject
              </button>
            )
          )}
        </div>

        <button
          className="collapse-toggle tabs-toggle"
          onClick={(e) => { e.stopPropagation(); setTabsCollapsed((v) => !v) }}
          aria-label={tabsCollapsed ? 'Expand tabs' : 'Collapse tabs'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"
            style={{ transform: tabsCollapsed ? 'rotate(180deg)' : 'none' }}>
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
          </svg>
        </button>
      </aside>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete the "${subjectLabel(confirmDelete)}" subject and all its notes? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}
