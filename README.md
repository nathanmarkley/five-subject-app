# Five Subject Notebook — App

A progressive web app (PWA) for the Five Subject Notebook note-taking system. Reads and writes plain Markdown files directly on your device — no backend, no cloud sync required.

## What it does

- Browse notes organized by **Notebooks** → **Subjects** → **Notes**
- Rich text editing (bold, italic, headings, lists, links, images)
- Images can be resized and aligned directly in the editor
- Saves notes as plain `.md` files with YAML frontmatter on your local machine
- Works offline after the first load
- Installable as a desktop or mobile app via PWA
- Optional: push notes to a GitHub repo from inside the app

## Browser support

Requires **Chrome, Edge, or Opera** (desktop or Android). The File System Access API used to read/write local files is not supported in Safari or Firefox.

## Running locally

```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm install
npm run dev
```

Then open `http://localhost:5173` in Chrome or Edge and click **Open Folder** to select your notes folder.

## Deploying to GitHub Pages

```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run deploy
```

Builds the app and pushes to the `gh-pages` branch. In your GitHub repo settings → Pages, set the source to the `gh-pages` branch.

Your app will be live at `https://<your-username>.github.io/five-subject-app/`

## Tech stack

- React 18 + Vite 6
- TipTap (rich text editor)
- `vite-plugin-pwa` — service worker + offline support
- `idb` — persists the folder handle across browser sessions
- `marked` + `turndown` — Markdown ↔ HTML conversion
- `gh-pages` — deploys to GitHub Pages

## Notes structure

The app expects a folder with this layout (the same as the `five-subject` notes repo):

```
your-notes-folder/
├── notebook-name/
│   └── subject-name/
│       └── note-title.md
```

Each `.md` file uses YAML frontmatter:

```markdown
---
title: Note Title
date: 2026-05-13
tags: [tag1, tag2]
---

Note content here.
```

## Data & privacy

- Notes never leave your device unless you use the GitHub push feature
- Your GitHub token (if configured) is stored only in your browser's localStorage
- No analytics, no telemetry, no third-party scripts
