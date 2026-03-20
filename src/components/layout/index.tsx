import React, { Fragment, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import App from '../../App';
import { useAuthStore } from '../../store/authStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import MainHeader from './MainHeader';

const Layout: React.FC = () => {
  const { loadFromStorage } = useAuthStore();
  const { loadFromStorage: loadFavoritesFromStorage } = useFavoritesStore();
  const location = useLocation();

  // Rotas onde MainHeader não deve aparecer
  const hiddenHeaderRoutes = ['/profiles', '/player'];
  const shouldShowHeader = !hiddenHeaderRoutes.includes(location.pathname);

  useEffect(() => {
    loadFromStorage();
    loadFavoritesFromStorage();
  }, []);

  return (
    <Fragment>
      {shouldShowHeader && <MainHeader scrolling={false} />}
        <App />
    </Fragment>
  );
};

export default Layout;
