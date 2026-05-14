# Five Subject Notebook App (working title)

A progressive web app (PWA) for the Five Subject Notebook note-taking system. Reads and writes plain Markdown files directly on your device — no backend, no cloud sync required.

## What it does

- Browse notes organized by **Notebooks** → **Subjects** → **Notes**
- Rich text editing (bold, italic, headings, lists, links, images)
- Images can be resized and aligned directly in the editor
- Saves notes as plain `.md` files with YAML frontmatter on your local machine
- Works offline after the first load
- Installable as a desktop or mobile app via PWA

## Saving & backing up notes

- **Ctrl+S** (or the Save button) saves the active note to your local files immediately
- Notes are plain `.md` files — back them up however you like
- Recommended: use **GitHub Desktop** to commit and push your notes folder to GitHub for version history and backup. Open your notes repo in GitHub Desktop, commit changes after editing sessions, and push to keep everything safe.

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

- Notes never leave your device — everything stays local
- No analytics, no telemetry, no third-party scripts

## License

This project is licensed under the Business Source License 1.1 (BUSL-1.1). Free for personal, non-commercial use. Commercial use requires a license from the author. Modifications are only permitted as contributions to this project. On May 14, 2040 this license converts to GNU General Public License v3.0.

## Contributing

Found a bug or have an idea for a new feature? I'd love to hear from you! Head over to the [Issues tab](../../issues) and open a new issue — there are templates for both **bug reports** and **feature requests** to make it easy.

A few things already in the pipeline (no need to file these):

- Paper style toggle — lined, grid, or plain white
- Improved iOS mobile experience
- Themes and custom notebook cover colors
- Custom notebook icons

Outside of those, all feedback is welcome. This is a personal project shared with the community, so even small quality-of-life suggestions are appreciated.
