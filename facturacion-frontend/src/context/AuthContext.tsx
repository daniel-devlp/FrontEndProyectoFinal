import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken } from '../services/authService';

interface AuthContextProps {
  isAuthenticated: boolean;
  userRole: string;
  login: (role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('');

  // Cargar el estado de autenticación desde el token al iniciar
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const userData = JSON.parse(atob(token.split('.')[1])); // Decodificar el payload del JWT
        setIsAuthenticated(true);
        setUserRole(userData.roles && userData.roles.length > 0 ? userData.roles[0] : '');
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }, []);

  const login = (role: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('userData', JSON.stringify({ roles: [role] })); // Guardar el rol en localStorage
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('');
    localStorage.removeItem('userData'); // Eliminar los datos del usuario
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
