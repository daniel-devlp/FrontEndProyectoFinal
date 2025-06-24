import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  userRole?: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, userRole, children }) => {
  const { isAuthenticated, loading, isInitialized } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (!isInitialized || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#667eea'
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  // Solo redirigir después de verificar completamente
  if (!isAuthenticated) {
    console.log('Usuario no autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    const redirectPath = userRole === "Administrator" ? "/admin" : userRole === "User" ? "/user" : "/";
    console.log('Redirigiendo a:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
