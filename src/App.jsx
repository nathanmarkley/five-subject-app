import { AppProvider } from './AppContext.jsx'
import TopBar from './components/TopBar.jsx'
import NotebookShelf from './components/NotebookShelf.jsx'
import SubjectTabs from './components/SubjectTabs.jsx'
import NotesList from './components/NotesList.jsx'
import Editor from './components/Editor.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'

function Layout() {
  return (
    <div className="app-root">
      <TopBar />
      <div className="app-shell">
        <NotebookShelf />
        <SubjectTabs />
        <NotesList />
        <Editor />
        <SettingsPanel />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  )
}
