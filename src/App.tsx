import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { ConfigServer } from './pages/ConfigServer';
import { Home } from './pages/Home';
import { Live } from './pages/Live';
import { Login } from './pages/Login';
import { Movies } from './pages/Movies';
import { Player } from './pages/Player';
import { ProfileSelect } from './pages/ProfileSelect';
import { PageSeries } from './pages/Series';
import { DetailSeries } from './pages/DetailSeries';
import { WatchHistory } from './pages/WatchHistory';
import { useAuthStore } from './store/authStore';
import { DetailMovie } from './pages/DetailMovie';

function App() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/profiles" /> : <Navigate to="/login" />}
      />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/profiles" /> : <Login />} />
      <Route
        path="/profiles"
        element={isAuthenticated ? <ProfileSelect /> : <Navigate to="/login" />}
      />
      <Route path="/home" element={<Home />} />
      <Route path="/movie" element={<Movies />} />
      <Route path="/series" element={<PageSeries />} />
      <Route path="/detail-movie" element={<DetailMovie />} />
      <Route path="/detail-series" element={<DetailSeries />} />
      <Route path="/live" element={<Live />} />
      <Route path="/watch-history" element={<WatchHistory />} />
      <Route path="/player" element={<Player />} />
      <Route path="/config-server" element={<ConfigServer />} />
    </Routes>
  );
}

export default App;
