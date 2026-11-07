import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import UnsupportedBrowser from './UnsupportedBrowser.jsx'
import './index.css'

const supportsFolders = 'showDirectoryPicker' in window

if (supportsFolders) {
  registerSW({ immediate: true })
} else {
  // Suppress Chrome's "Install app" banner on browsers where the app can't work
  window.addEventListener('beforeinstallprompt', (e) => e.preventDefault())

  // Clean up any service worker registered on an earlier visit
  navigator.serviceWorker?.getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {supportsFolders ? <App /> : <UnsupportedBrowser />}
  </React.StrictMode>
)
