import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { ConfigServer } from './pages/ConfigServer';
import { Favorites } from './pages/Favorites';
import { Home } from './pages/Home';
import { Live } from './pages/Live';
import { Login } from './pages/Login';
import { Movies } from './pages/Movies';
import { Player } from './pages/Player';
import { ProfileSelect } from './pages/ProfileSelect';
import { PageSeries } from './pages/Series';
import { WatchHistory } from './pages/WatchHistory';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/profiles" /> : <Login />} />
      <Route path="/profiles" element={isAuthenticated ? <ProfileSelect /> : <Navigate to="/" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/movie" element={<Movies />} />
      <Route path="/series" element={<PageSeries />} />
      <Route path="/live" element={<Live />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/watch-history" element={<WatchHistory />} />
      <Route path="/player" element={<Player />} />
      <Route path="/config-server" element={<ConfigServer />} />
    </Routes>
  );
}

export default App;
