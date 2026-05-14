const API = 'https://api.github.com'

async function apiGet(url, token) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } })
  if (!r.ok) throw new Error(`GitHub API ${r.status}: ${await r.text()}`)
  return r.json()
}

async function apiPost(url, token, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`GitHub API ${r.status}: ${await r.text()}`)
  return r.json()
}

async function apiPatch(url, token, body) {
  const r = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`GitHub API ${r.status}: ${await r.text()}`)
  return r.json()
}

// Walk the root directory handle and collect all .md files as { path, content } pairs.
// Skips app/, node_modules, dot-folders.
async function collectMdFiles(rootHandle, prefix = '') {
  const files = []
  for await (const [name, handle] of rootHandle.entries()) {
    if (name.startsWith('.') || name === 'app' || name === 'node_modules') continue
    if (handle.kind === 'directory') {
      const sub = await collectMdFiles(handle, prefix ? `${prefix}/${name}` : name)
      files.push(...sub)
    } else if (name.endsWith('.md') || name === 'README.md') {
      const file = await handle.getFile()
      const content = await file.text()
      files.push({ path: prefix ? `${prefix}/${name}` : name, content })
    }
  }
  return files
}

export async function pushAllNotes({ token, owner, repo, branch = 'main', rootHandle }) {
  const base = `${API}/repos/${owner}/${repo}`

  // 1. Get latest commit on branch
  const refData = await apiGet(`${base}/git/ref/heads/${branch}`, token)
  const latestSha = refData.object.sha

  // 2. Get the base tree sha
  const commitData = await apiGet(`${base}/git/commits/${latestSha}`, token)
  const baseTreeSha = commitData.tree.sha

  // 3. Collect all .md files
  const mdFiles = await collectMdFiles(rootHandle)
  if (mdFiles.length === 0) throw new Error('No .md files found in folder.')

  // 4. Create blobs for each file
  const treeEntries = await Promise.all(
    mdFiles.map(async ({ path, content }) => {
      const blob = await apiPost(`${base}/git/blobs`, token, {
        content: btoa(unescape(encodeURIComponent(content))),
        encoding: 'base64',
      })
      return { path, mode: '100644', type: 'blob', sha: blob.sha }
    })
  )

  // 5. Create new tree on top of base
  const newTree = await apiPost(`${base}/git/trees`, token, {
    base_tree: baseTreeSha,
    tree: treeEntries,
  })

  // 6. Create commit
  const now = new Date().toISOString()
  const newCommit = await apiPost(`${base}/git/commits`, token, {
    message: `notes: sync from Five Subject PWA (${now.slice(0, 10)})`,
    tree: newTree.sha,
    parents: [latestSha],
  })

  // 7. Update branch ref
  await apiPatch(`${base}/git/refs/heads/${branch}`, token, { sha: newCommit.sha })

  return { commitSha: newCommit.sha, fileCount: mdFiles.length }
}
