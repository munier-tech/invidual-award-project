import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ToastContainer as NotifyContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
      {/* Pages that use react-toastify (Dashboard, Quran/Subci sections, salaries)
          need this container mounted or their toasts never render. */}
      <NotifyContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  </React.StrictMode>,
)
