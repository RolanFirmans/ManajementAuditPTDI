import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect ke halaman login, sambil menyimpan lokasi yang dicoba diakses
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  // Jika sudah terotentikasi, render child routes
  return <Outlet />;
};

export default ProtectedRoute;