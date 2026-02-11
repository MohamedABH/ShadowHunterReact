import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Games from './components/Games'
import GameCreation from './components/GameCreation'
import MyGame from './components/MyGame'

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <nav>
          <Link to="/login">Connexion</Link> |{' '}
          <Link to="/register">Inscription</Link> |{' '}
          <Link to="/games">Parties</Link> |{' '}
          <Link to="/myGame">Ma partie</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/create" element={<GameCreation />} />
          <Route path="/myGame" element={<MyGame />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}