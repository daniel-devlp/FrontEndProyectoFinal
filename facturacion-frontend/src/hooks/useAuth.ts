import { useState } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [technicalMessage, setTechnicalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setErrorCode(null);
    setTechnicalMessage(null);

    try {
      const { token, user } = await authService.login(email, password);
      storeAuthData(token, user);
      setIsAuthenticated(true);
      return user.role; // Devuelve el rol del usuario para redirección
    } catch (error: any) {
      setErrorCode(error.errorCode || 'UNKNOWN');
      setTechnicalMessage(error.message || 'Error al conectar con el servidor.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('authHeader');
    setIsAuthenticated(false);
    window.location.href = '/'; // Redirige al login
  };

  const storeAuthData = (token: string, user: any) => {
    if (!user || !user.roles || user.roles.length === 0) {
      console.error('El usuario no tiene roles definidos:', user);
      throw new Error('El usuario no tiene roles válidos.');
    }

    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    const authHeader = `Bearer ${token}`;
    localStorage.setItem('authHeader', authHeader);

    console.log('Datos almacenados en localStorage:', {
      authToken: token,
      userData: user,
      authHeader,
    });
  };

  return {
    isAuthenticated,
    errorCode,
    technicalMessage,
    loading,
    login,
    logout,
  };
};
