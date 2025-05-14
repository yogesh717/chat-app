import React from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import PublicRoutes from './routes/PublicRoutes';
import PrivateRoutes from './routes/PrivateRoutes';

function App() {
  const location = useLocation();
  const noSidebarPaths = ['/', '/login', '/signup','/forgot-password'];
  const hideSidebar = noSidebarPaths.includes(location.pathname);

  return (
    <div className="d-flex w-100 vh-100">
      {!hideSidebar && <Sidebar />}
      <Container fluid className="p-0 m-0 flex-grow-1">
        <PublicRoutes />
        <PrivateRoutes />
      </Container>
    </div>
  );
}

export default App;
