import { useState } from 'react'
import { useApp } from '../AppContext.jsx'

export default function SettingsPanel() {
  const {
    settingsOpen, setSettingsOpen,
    openFolder, rootHandle,
    githubSettings, setGithubSettings,
  } = useApp()

  const [gh, setGh] = useState({
    owner: githubSettings.owner || '',
    repo: githubSettings.repo || '',
    branch: githubSettings.branch || 'main',
    token: githubSettings.token || '',
  })
  const [ghSaved, setGhSaved] = useState(false)

  const saveGh = () => {
    setGithubSettings(gh)
    setGhSaved(true)
    setTimeout(() => setGhSaved(false), 2000)
  }

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
          <h3>GitHub Sync</h3>
          <p className="settings-hint">
            Enter your GitHub details to enable the "Push to GitHub" button.
            Your token is stored only in this browser's localStorage.
          </p>
          <div className="gh-fields">
            <label className="gh-label">
              Owner (username or org)
              <input className="gh-input" value={gh.owner} onChange={(e) => setGh((s) => ({ ...s, owner: e.target.value }))} placeholder="e.g. nathanmarkley" spellCheck={false} />
            </label>
            <label className="gh-label">
              Repository name
              <input className="gh-input" value={gh.repo} onChange={(e) => setGh((s) => ({ ...s, repo: e.target.value }))} placeholder="e.g. five-subject" spellCheck={false} />
            </label>
            <label className="gh-label">
              Branch
              <input className="gh-input" value={gh.branch} onChange={(e) => setGh((s) => ({ ...s, branch: e.target.value }))} placeholder="main" spellCheck={false} />
            </label>
            <label className="gh-label">
              Personal Access Token
              <input className="gh-input" type="password" value={gh.token} onChange={(e) => setGh((s) => ({ ...s, token: e.target.value }))} placeholder="ghp_…" spellCheck={false} autoComplete="off" />
            </label>
            <p className="settings-hint" style={{ marginTop: '4px' }}>
              Token needs <code>repo</code> scope.{' '}
              <a href="https://github.com/settings/tokens/new?scopes=repo&description=Five+Subject+PWA" target="_blank" rel="noreferrer" style={{ color: '#2b6cb0' }}>
                Create one on GitHub →
              </a>
            </p>
            <button className="settings-action-btn" onClick={saveGh} style={{ marginTop: '8px' }}>
              {ghSaved ? '✓ Saved!' : 'Save'}
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3>About</h3>
          <p className="settings-hint">Five Subject Notebook v0.1.0</p>
          <p className="settings-hint">Notes are saved as plain Markdown files with YAML frontmatter.</p>
        </section>
      </aside>
    </>
  )
}
