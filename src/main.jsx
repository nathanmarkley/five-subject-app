import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Unregister any stale service workers that may block loading, but only
// if they're from a different scope (leftover from a wrong base path).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      if (!reg.scope.includes('/five-subject-app/')) {
        reg.unregister()
      }
    }
  }).catch(() => {
    // Network or permission errors — leave existing registrations alone
  })
}
