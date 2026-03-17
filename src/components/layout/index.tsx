import React, { Fragment, useEffect } from 'react';
import App from '../../App';
import MainHeader from './MainHeader';
import { useAuthStore } from '../../store/authStore';

const Layout: React.FC = () => {
    const { isAuthenticated, loadFromStorage, profiles } = useAuthStore()

    useEffect(() => {
        loadFromStorage()
    }, [])
    return <Fragment>
        <MainHeader scrolling={false} />
        <App />
    </Fragment>;
}

export default Layout;