# Five Subject Notebook App — Developer Guide

## Day-to-day workflow

**Start the dev server:**
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
cd "C:\Users\natha\OneDrive\Documents\code\five-subject-app"
npm run dev
```
Open `http://localhost:5173` in Chrome or Edge.

**Stop the dev server:** Press `Ctrl+C` in the terminal.

**Push changes to GitHub:**
```powershell
git add .
git commit -m "your message"
git push origin main
```

---

## Deploying to GitHub Pages

```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run deploy
```

This builds the app and pushes `dist/` to the `gh-pages` branch automatically.

**First-time setup:** GitHub repo → Settings → Pages → source: `gh-pages` branch, root `/`.

Live URL: `https://<your-username>.github.io/five-subject-app/`

---

## Security

`npm audit` returns **0 vulnerabilities**. Full breakdown:

| Area | Status | Notes |
|---|---|---|
| `npm audit` | ✅ 0 vulnerabilities | All packages safe |
| Your notes/files | ✅ Never leave your device | File System Access API is pure local |
| Images | ✅ Stored as base64 in .md files | Stays on your machine |
| GitHub token (PAT) | ⚠️ Stored in `localStorage` | Browser-local only — no server sees it. Don't use on a shared computer while logged in. |
| Third-party scripts | ✅ None | No analytics, no tracking, no CDN |
| Packages | ✅ All well-known | TipTap, Vite, marked, turndown, idb, vite-plugin-pwa, gh-pages |

---

## Browser support

Requires **Chrome, Edge, or Opera**. Safari and Firefox do not support the File System Access API. Chrome for Android works; iOS Safari does not.

---

## Who can use it & data isolation

- Anyone with the GitHub Pages URL can open and use the app
- Every user's notes live on **their own device** — no shared database
- Your notes never leave your machine except when you use "Push to GitHub"
- Your GitHub token is stored in your browser only — other users start with no token
- Other users must enter their own token, owner, and repo in Settings to push anywhere

---

## Sharing & publishing

**Sharing:** Send people the GitHub Pages URL — nothing else needed.

**Open source:** Make the repo public, add a license (MIT is standard), update the README.

**App stores:** The PWA install prompt in Chrome/Edge is sufficient for most users. Submitting to the Google Play Store or Microsoft Store is possible but a separate process.

---

## Project structure

```
five-subject-app/
├── src/
│   ├── App.jsx                  # Root layout
│   ├── AppContext.jsx           # Global state & all actions
│   ├── main.jsx                 # React entry point
│   ├── index.css                # All styles
│   ├── components/
│   │   ├── Editor.jsx           # TipTap editor + resizable image extension
│   │   ├── ImageNodeView.jsx    # Custom image node (resize, align, delete)
│   │   ├── NotebookShelf.jsx    # Left pane — notebook list
│   │   ├── SubjectTabs.jsx      # Second pane — subject tabs
│   │   ├── NotesList.jsx        # Third pane — notes list + search
│   │   ├── Toolbar.jsx          # Editor toolbar
│   │   ├── SettingsPanel.jsx    # Settings drawer
│   │   └── Dialogs.jsx          # InlineInput + ConfirmDialog
│   ├── hooks/
│   │   └── useFileSystem.js     # All File System Access API operations
│   └── utils/
│       ├── markdown.js          # Markdown ↔ HTML, frontmatter parsing
│       └── github.js            # GitHub REST API push
├── public/
│   └── icons/                   # PWA icons
├── index.html
├── vite.config.js
├── package.json
├── README.md
└── GUIDE.md                     # This file
```
