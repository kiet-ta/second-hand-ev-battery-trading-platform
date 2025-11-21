import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './router/Router.jsx'
import React from 'react'
function App() {
  return (
    <RouterProvider router={router} />,
    <GeminiChatWidget />
  )
}
export default App
