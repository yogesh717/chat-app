import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Sidebar from './components/layout/Sidebar';
import PublicRoutes from './routes/PublicRoutes';
import PrivateRoutes from './routes/PrivateRoutes';
import { getCurrentUserApi } from './components/Utils/api';
import { updateUser, logout } from './redux/slices/authSlice';
import './App.css';

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const noSidebarPaths = ['/', '/login', '/signup','/forgot-password'];
  const hideSidebar = noSidebarPaths.includes(location.pathname);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    getCurrentUserApi().then((res) => {
      if (res?.success && res?.user) {
        dispatch(updateUser(res.user));
      } else {
        dispatch(logout());
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-shell">
      {!hideSidebar && <Sidebar />}
      <Container fluid className={hideSidebar ? "flex-grow-1 p-0" : "app-content"}>
        <Routes>
          {PublicRoutes}
          {PrivateRoutes}
        </Routes>
      </Container>
    </div>
  );
}

export default App;
