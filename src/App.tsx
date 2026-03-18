import { BrowserRouter } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import AppRoutes from './routes/AppRoutes'
import { getUsername, isLoggedIn } from './utils/auth'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn())
  const [username, setUsername] = useState(() => getUsername())

  useEffect(() => {
    const handleAuthChange = () => {
      setLoggedIn(isLoggedIn())
      setUsername(getUsername())
    }

    window.addEventListener('auth-changed', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-secondary text-space_indigo">
        <Navbar loggedIn={loggedIn} username={username} />

        <main className="mx-auto w-full py-6">
          <AppRoutes loggedIn={loggedIn} />
        </main>
      </div>
    </BrowserRouter>
  )
}