import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Favorites } from './pages/Favorites'
import { Home } from './pages/Home'
import { Live } from './pages/Live'
import { Login } from './pages/Login'
import { Movies } from './pages/Movies'
import { Player } from './pages/Player'
import { ProfileSelect } from './pages/ProfileSelect'
import { Series } from './pages/Series'
import { WatchHistory } from './pages/WatchHistory'
import { useAuthStore } from './store/authStore'

function App() {
  const { isAuthenticated, loadFromStorage, profiles } = useAuthStore()

  useEffect(() => {
    loadFromStorage()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" /> : <Login />}
        />
        <Route
          path="/profiles"
          element={
            isAuthenticated ? (
              profiles.length > 0 ? (
                <ProfileSelect />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/home" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/live" element={<Live />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/watch-history" element={<WatchHistory />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
