import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import UnsupportedBrowser from './UnsupportedBrowser.jsx'
import './index.css'

const supportsFolders = 'showDirectoryPicker' in window

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {supportsFolders ? <App /> : <UnsupportedBrowser />}
  </React.StrictMode>
)
