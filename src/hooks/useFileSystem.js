import { useState, useCallback } from 'react'
import { openDB } from 'idb'
import { parseFrontmatter, noteTitle, notePreview } from '../utils/markdown.js'

const DB_NAME = 'five-subject-fs'
const STORE = 'handles'
const ROOT_KEY = 'rootDir'

async function copyDirectory(srcHandle, destHandle) {
  for await (const [name, handle] of srcHandle.entries()) {
    if (handle.kind === 'file') {
      const file = await handle.getFile()
      const content = await file.text()
      const newHandle = await destHandle.getFileHandle(name, { create: true })
      const writable = await newHandle.createWritable()
      await writable.write(content)
      await writable.close()
    } else if (handle.kind === 'directory') {
      const newSub = await destHandle.getDirectoryHandle(name, { create: true })
      await copyDirectory(handle, newSub)
    }
  }
}

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE)
    },
  })
}

async function saveHandle(handle) {
  const db = await getDb()
  await db.put(STORE, handle, ROOT_KEY)
}

async function loadHandle() {
  const db = await getDb()
  return db.get(STORE, ROOT_KEY)
}

async function verifyPermission(handle, readWrite = false) {
  const opts = readWrite ? { mode: 'readwrite' } : { mode: 'read' }
  if ((await handle.queryPermission(opts)) === 'granted') return true
  if ((await handle.requestPermission(opts)) === 'granted') return true
  return false
}

// Walk notebook/subject tree and collect note metadata
async function scanNotes(rootHandle) {
  const notebooks = []
  for await (const [nbName, nbHandle] of rootHandle.entries()) {
    if (nbHandle.kind !== 'directory') continue
    if (nbName.startsWith('.') || nbName.startsWith('_') || nbName === 'app') continue

    const subjects = []
    for await (const [subName, subHandle] of nbHandle.entries()) {
      if (subHandle.kind !== 'directory') continue
      if (subName.startsWith('.')) continue

      const notes = []
      for await (const [fileName, fileHandle] of subHandle.entries()) {
        if (!fileName.endsWith('.md')) continue
        const file = await fileHandle.getFile()
        const raw = await file.text()
        const { frontmatter, body } = parseFrontmatter(raw)
        notes.push({
          fileName,
          fileHandle,
          title: noteTitle(frontmatter, fileName),
          date: frontmatter.date || '',
          tags: frontmatter.tags || [],
          preview: notePreview(body),
          modifiedAt: file.lastModified,
        })
      }
      notes.sort((a, b) => b.modifiedAt - a.modifiedAt)
      subjects.push({ name: subName, handle: subHandle, notes })
    }
    notebooks.push({ name: nbName, handle: nbHandle, subjects })
  }
  // Stable order: personal first, then work
  notebooks.sort((a, b) => {
    const order = ['personal', 'work']
    return order.indexOf(a.name) - order.indexOf(b.name)
  })
  return notebooks
}

export function useFileSystem() {
  const [rootHandle, setRootHandle] = useState(null)
  const [notebooks, setNotebooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const openFolder = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
      await saveHandle(handle)
      setRootHandle(handle)
      const nbs = await scanNotes(handle)
      setNotebooks(nbs)
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const restoreFolder = useCallback(async () => {
    try {
      setLoading(true)
      const handle = await loadHandle()
      if (!handle) return
      const ok = await verifyPermission(handle, true)
      if (!ok) return
      setRootHandle(handle)
      const nbs = await scanNotes(handle)
      setNotebooks(nbs)
    } catch {
      // silently ignore — user will click Open Folder
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshNotes = useCallback(async (handle) => {
    if (!handle) return
    const nbs = await scanNotes(handle)
    setNotebooks(nbs)
  }, [])

  const readNote = useCallback(async (fileHandle) => {
    const file = await fileHandle.getFile()
    return file.text()
  }, [])

  const writeNote = useCallback(async (fileHandle, content) => {
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  }, [])

  const createNote = useCallback(async (subjectHandle, fileName, content) => {
    const fileHandle = await subjectHandle.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
    return fileHandle
  }, [])

  const deleteNote = useCallback(async (subjectHandle, fileName) => {
    await subjectHandle.removeEntry(fileName)
  }, [])

  const createSubject = useCallback(async (notebookHandle, name) => {
    await notebookHandle.getDirectoryHandle(name, { create: true })
  }, [])

  const deleteSubject = useCallback(async (notebookHandle, subjectName) => {
    await notebookHandle.removeEntry(subjectName, { recursive: true })
  }, [])

  const createNotebook = useCallback(async (handle, name) => {
    await handle.getDirectoryHandle(name, { create: true })
  }, [])

  const deleteNotebook = useCallback(async (handle, notebookName) => {
    await handle.removeEntry(notebookName, { recursive: true })
  }, [])

  const renameSubject = useCallback(async (notebookHandle, oldName, newName) => {
    const oldDir = await notebookHandle.getDirectoryHandle(oldName)
    const newDir = await notebookHandle.getDirectoryHandle(newName, { create: true })
    await copyDirectory(oldDir, newDir)
    await notebookHandle.removeEntry(oldName, { recursive: true })
  }, [])

  const renameNotebook = useCallback(async (handle, oldName, newName) => {
    const oldDir = await handle.getDirectoryHandle(oldName)
    const newDir = await handle.getDirectoryHandle(newName, { create: true })
    await copyDirectory(oldDir, newDir)
    await handle.removeEntry(oldName, { recursive: true })
  }, [])

  return {
    rootHandle,
    notebooks,
    loading,
    error,
    openFolder,
    restoreFolder,
    refreshNotes,
    readNote,
    writeNote,
    createNote,
    deleteNote,
    createSubject,
    deleteSubject,
    createNotebook,
    deleteNotebook,
    renameSubject,
    renameNotebook,
  }
}
