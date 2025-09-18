import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GoogleLoginBase from './pages/LoginPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleLoginBase />
  </StrictMode>,
)
