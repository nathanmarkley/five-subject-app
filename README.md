# Five Subject Notebook App (working title)

A note-taking app that works like a physical five-subject notebook. Your notes are saved as plain files on your own device — no account, no cloud, no subscription required.

## What it does

- Organizes notes by **Notebooks → Subjects → Notes** — just like a real notebook
- Rich text editing: bold, italic, headings, lists, links, and images
- Images can be resized and aligned right in the editor
- Saves to plain text files on your computer — easy to read, search, and back up
- Works offline after the first load
- Installable as a desktop or mobile app

## Saving & backing up notes

Ctrl+S (or the Save button) saves your note instantly to your chosen folder on your device. Your notes are plain `.md` files — they live on your computer, not in any cloud.

You can back them up any way you like:
- Copy the folder to an external drive or USB
- Sync with Dropbox, OneDrive, or iCloud
- Use GitHub Desktop to push to a private GitHub repo for version history

No account required. No subscription. Your notes, your choice.

## Browser support

Requires **Chrome, Edge, or Opera** (desktop or Android). Safari and Firefox are not supported — they don't allow web apps to read and write local files directly. Chrome on Android works; iOS is not supported yet.

## How your notes are stored

The app reads from a folder you choose on your computer. Notes are organized like this:

```
your-notes-folder/
├── notebook-name/
│   └── subject-name/
│       └── note-title.md
```

Each note is a plain text file you can open in any text editor.

## Running locally (for developers)

```powershell
npm install
npm run dev
```

Then open `http://localhost:5173` in Chrome or Edge and click **Open Folder** to select your notes folder.

## Built with

- React + Vite
- TipTap (rich text editor)
- PWA support for offline use and installability

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
