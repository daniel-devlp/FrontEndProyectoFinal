import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
  userRole: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, userRole, children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log('Usuario no autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    const redirectPath = userRole === "Administrator" ? "/admin" : userRole === "User" ? "/user" : "/";
    console.log('Redirigiendo a:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
