import React, { Fragment, useEffect } from 'react';
import App from '../../App';
import { useAuthStore } from '../../store/authStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import MainHeader from './MainHeader';

const Layout: React.FC = () => {
  const { loadFromStorage } = useAuthStore();
  const { loadFromStorage: loadFavoritesFromStorage } = useFavoritesStore();

  useEffect(() => {
    loadFromStorage();
    loadFavoritesFromStorage();
  }, []);
  return (
    <Fragment>
      <MainHeader scrolling={false} />
      <App />
    </Fragment>
  );
};

export default Layout;
