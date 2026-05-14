import { useApp } from '../AppContext.jsx'

export default function SettingsPanel() {
  const {
    settingsOpen, setSettingsOpen,
    openFolder, rootHandle,
  } = useApp()

  if (!settingsOpen) return null

  return (
    <>
      <div className="settings-backdrop" onClick={() => setSettingsOpen(false)} />
      <aside className="settings-panel" aria-label="Settings">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={() => setSettingsOpen(false)} aria-label="Close settings">
            ✕
          </button>
        </div>

        <section className="settings-section">
          <h3>Folder</h3>
          <p className="settings-hint">
            {rootHandle ? `Connected to: ${rootHandle.name}` : 'No folder connected.'}
          </p>
          <button className="settings-action-btn" onClick={openFolder}>
            {rootHandle ? 'Change Folder' : 'Open Folder'}
          </button>
        </section>

        <section className="settings-section">
          <h3>About</h3>
          <p className="settings-hint">Five Subject Notebook v1.0.0</p>
          <p className="settings-hint">Notes are saved as plain Markdown files with YAML frontmatter.</p>
        </section>
      </aside>
    </>
  )
}
