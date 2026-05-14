import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useFileSystem } from './hooks/useFileSystem.js'
import { parseNoteFile, buildNoteContent, noteTitle, slugify } from './utils/markdown.js'
import { pushAllNotes } from './utils/github.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const fs = useFileSystem()

  const [selectedNotebook, setSelectedNotebook] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null) // { fileHandle, fileName, frontmatter, html }
  const [editorHtml, setEditorHtml] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [paperStyle, setPaperStyle] = useState('clean')
  const [githubSettings, setGithubSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('githubSettings') || '{}') } catch { return {} }
  })
  const [pushStatus, setPushStatus] = useState(null) // null | 'pushing' | 'done' | 'error'
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Pane collapse state
  const [shelfCollapsed, setShelfCollapsed] = useState(false)
  const [tabsCollapsed, setTabsCollapsed] = useState(false)
  const [listCollapsed, setListCollapsed] = useState(false)

  // Restore folder on mount
  useEffect(() => {
    fs.restoreFolder()
  }, [])

  // Persist settings
  useEffect(() => { localStorage.setItem('paperStyle', paperStyle) }, [paperStyle])
  useEffect(() => { localStorage.setItem('githubSettings', JSON.stringify(githubSettings)) }, [githubSettings])

  // Auto-select first notebook/subject after scan
  useEffect(() => {
    if (fs.notebooks.length && !selectedNotebook) {
      setSelectedNotebook(fs.notebooks[0].name)
      if (fs.notebooks[0].subjects.length) {
        setSelectedSubject(fs.notebooks[0].subjects[0].name)
      }
    }
  }, [fs.notebooks])

  const currentNotebook = fs.notebooks.find((n) => n.name === selectedNotebook)
  const currentSubject = currentNotebook?.subjects.find((s) => s.name === selectedSubject)
  const currentNotes = currentSubject?.notes || []

  const selectNote = useCallback(async (noteItem) => {
    if (isDirty && selectedNote) {
      const ok = window.confirm('You have unsaved changes. Discard them?')
      if (!ok) return
    }
    const raw = await fs.readNote(noteItem.fileHandle)
    const { frontmatter, html } = parseNoteFile(raw)
    setSelectedNote({ ...noteItem, frontmatter })
    setEditorHtml(html)
    setIsDirty(false)
  }, [isDirty, selectedNote, fs])

  const saveNote = useCallback(async () => {
    if (!selectedNote || !currentSubject) return
    const content = buildNoteContent(selectedNote.frontmatter, editorHtml)

    // Rename file if title slug no longer matches current filename
    const desiredSlug = slugify(selectedNote.frontmatter.title || 'untitled') + '.md'
    if (desiredSlug !== selectedNote.fileName) {
      // Find a non-colliding name
      let targetName = desiredSlug
      const existingNames = new Set(currentSubject.notes.map((n) => n.fileName))
      existingNames.delete(selectedNote.fileName) // don't count the current file
      let suffix = 2
      while (existingNames.has(targetName)) {
        targetName = desiredSlug.replace('.md', `-${suffix}.md`)
        suffix++
      }
      const newFileHandle = await fs.createNote(currentSubject.handle, targetName, content)
      await fs.deleteNote(currentSubject.handle, selectedNote.fileName)
      setSelectedNote((prev) => prev ? { ...prev, fileName: targetName, fileHandle: newFileHandle } : prev)
    } else {
      await fs.writeNote(selectedNote.fileHandle, content)
    }

    setIsDirty(false)
    await fs.refreshNotes(fs.rootHandle)
  }, [selectedNote, editorHtml, currentSubject, fs])

  const newNote = useCallback(async () => {
    if (!currentSubject) return
    const date = new Date().toISOString().slice(0, 10)
    // Pick a non-colliding initial filename
    const existingNames = new Set(currentSubject.notes.map((n) => n.fileName))
    let slug = 'new-note.md'
    let suffix = 2
    while (existingNames.has(slug)) { slug = `new-note-${suffix++}.md` }
    const frontmatter = { title: 'New Note', date, tags: [] }
    const content = buildNoteContent(frontmatter, '<p></p>')
    const fileHandle = await fs.createNote(currentSubject.handle, slug, content)
    await fs.refreshNotes(fs.rootHandle)
    setSelectedNote({ fileHandle, fileName: slug, frontmatter, title: 'New Note' })
    setEditorHtml('<p></p>')
    setIsDirty(false)
  }, [currentSubject, fs])

  const updateFrontmatter = useCallback((key, value) => {
    setSelectedNote((prev) => prev ? { ...prev, frontmatter: { ...prev.frontmatter, [key]: value } } : prev)
    setIsDirty(true)
  }, [])

  const onEditorUpdate = useCallback((html) => {
    setEditorHtml(html)
    setIsDirty(true)
  }, [])

  // --- Delete / Create helpers ---

  const removeNote = useCallback(async (noteItem) => {
    if (!currentSubject) return
    await fs.deleteNote(currentSubject.handle, noteItem.fileName)
    if (selectedNote?.fileName === noteItem.fileName) {
      setSelectedNote(null)
      setEditorHtml('')
      setIsDirty(false)
    }
    await fs.refreshNotes(fs.rootHandle)
  }, [currentSubject, selectedNote, fs])

  const removeSubject = useCallback(async (subjectName) => {
    if (!currentNotebook) return
    await fs.deleteSubject(currentNotebook.handle, subjectName)
    if (selectedSubject === subjectName) {
      setSelectedSubject(null)
      setSelectedNote(null)
      setEditorHtml('')
    }
    await fs.refreshNotes(fs.rootHandle)
  }, [currentNotebook, selectedSubject, fs])

  const removeNotebook = useCallback(async (notebookName) => {
    await fs.deleteNotebook(fs.rootHandle, notebookName)
    if (selectedNotebook === notebookName) {
      setSelectedNotebook(null)
      setSelectedSubject(null)
      setSelectedNote(null)
      setEditorHtml('')
    }
    await fs.refreshNotes(fs.rootHandle)
  }, [selectedNotebook, fs])

  const addSubject = useCallback(async (name) => {
    if (!currentNotebook) return
    await fs.createSubject(currentNotebook.handle, name)
    await fs.refreshNotes(fs.rootHandle)
    setSelectedSubject(name)
    setSelectedNote(null)
  }, [currentNotebook, fs])

  const addNotebook = useCallback(async (name) => {
    await fs.createNotebook(fs.rootHandle, name)
    await fs.refreshNotes(fs.rootHandle)
    setSelectedNotebook(name)
    setSelectedSubject(null)
    setSelectedNote(null)
  }, [fs])

  const doRenameSubject = useCallback(async (oldName, newName) => {
    if (!currentNotebook || oldName === newName) return
    await fs.renameSubject(currentNotebook.handle, oldName, newName)
    if (selectedSubject === oldName) setSelectedSubject(newName)
    if (selectedSubject === oldName) setSelectedNote(null)
    await fs.refreshNotes(fs.rootHandle)
  }, [currentNotebook, selectedSubject, fs])

  const doRenameNotebook = useCallback(async (oldName, newName) => {
    if (oldName === newName) return
    await fs.renameNotebook(fs.rootHandle, oldName, newName)
    if (selectedNotebook === oldName) {
      setSelectedNotebook(newName)
      setSelectedNote(null)
    }
    await fs.refreshNotes(fs.rootHandle)
  }, [selectedNotebook, fs])

  const pushToGithub = useCallback(async () => {
    const { token, owner, repo, branch } = githubSettings
    if (!token || !owner || !repo) {
      setSettingsOpen(true)
      return
    }
    if (!fs.rootHandle) return
    setPushStatus('pushing')
    try {
      const result = await pushAllNotes({ token, owner, repo, branch: branch || 'main', rootHandle: fs.rootHandle })
      setPushStatus('done')
      setTimeout(() => setPushStatus(null), 3000)
      return result
    } catch (e) {
      setPushStatus('error:' + e.message)
      setTimeout(() => setPushStatus(null), 6000)
      throw e
    }
  }, [githubSettings, fs.rootHandle])

  return (
    <AppContext.Provider value={{
      ...fs,
      selectedNotebook, setSelectedNotebook,
      selectedSubject, setSelectedSubject,
      selectedNote, editorHtml, isDirty,
      paperStyle, setPaperStyle,
      githubSettings, setGithubSettings,
      pushToGithub, pushStatus,
      settingsOpen, setSettingsOpen,
      shelfCollapsed, setShelfCollapsed,
      tabsCollapsed, setTabsCollapsed,
      listCollapsed, setListCollapsed,
      currentNotebook, currentSubject, currentNotes,
      selectNote, saveNote, newNote,
      removeNote, removeSubject, removeNotebook,
      addSubject, addNotebook,
      doRenameSubject, doRenameNotebook,
      updateFrontmatter, onEditorUpdate,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
