import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [technicalMessage, setTechnicalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [requiresRoleSelection, setRequiresRoleSelection] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      const savedRole = localStorage.getItem('selectedRole');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        const userRoles = user.roles || [];
        
        if (userRoles.length > 1 && !savedRole) {
          // Usuario tiene múltiples roles pero no ha seleccionado uno
          setAvailableRoles(userRoles);
          setRequiresRoleSelection(true);
          setIsAuthenticated(false);
        } else if (userRoles.length === 1) {
          // Usuario tiene un solo rol, seleccionarlo automáticamente
          const singleRole = userRoles[0];
          authService.selectRole(singleRole);
          setSelectedRole(singleRole);
          setIsAuthenticated(true);
          setRequiresRoleSelection(false);
        } else if (savedRole) {
          // Usuario ya seleccionó un rol previamente
          setSelectedRole(savedRole);
          setIsAuthenticated(true);
          setRequiresRoleSelection(false);
        }
        
        console.log('Usuario autenticado:', user, 'Rol seleccionado:', savedRole);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      // Limpiar datos corruptos
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('authHeader');
      localStorage.removeItem('selectedRole');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setErrorCode(null);
    setTechnicalMessage(null);

    try {
      const { token, user } = await authService.login(email, password);
      storeAuthData(token, user);
      
      const userRoles = user.roles || [];
      
      if (userRoles.length > 1) {
        // Usuario tiene múltiples roles, requiere selección
        setAvailableRoles(userRoles);
        setRequiresRoleSelection(true);
        setIsAuthenticated(false);
        return { requiresRoleSelection: true, roles: userRoles };
      } else if (userRoles.length === 1) {
        // Usuario tiene un solo rol, seleccionarlo automáticamente
        const singleRole = userRoles[0];
        authService.selectRole(singleRole);
        setSelectedRole(singleRole);
        setIsAuthenticated(true);
        setRequiresRoleSelection(false);
        return { requiresRoleSelection: false, selectedRole: singleRole };
      } else {
        throw new Error('El usuario no tiene roles válidos.');
      }
    } catch (error: any) {
      setErrorCode(error.errorCode || 'UNKNOWN');
      setTechnicalMessage(error.message || 'Error al conectar con el servidor.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role: string) => {
    authService.selectRole(role);
    setSelectedRole(role);
    setRequiresRoleSelection(false);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setSelectedRole(null);
    setRequiresRoleSelection(false);
    setAvailableRoles([]);
    window.location.href = '/';
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

  const getCurrentUserRole = (): string | null => {
    return selectedRole || authService.getSelectedRole();
  };

  const hasRole = (requiredRole: string): boolean => {
    return authService.hasRole(requiredRole);
  };

  const canAccess = (allowedRoles: string[]): boolean => {
    return authService.canAccess(allowedRoles);
  };

  return {
    isAuthenticated,
    isInitialized,
    errorCode,
    technicalMessage,
    loading,
    requiresRoleSelection,
    availableRoles,
    selectedRole: getCurrentUserRole(),
    login,
    logout,
    selectRole,
    checkAuthStatus,
    hasRole,
    canAccess,
  };
};
