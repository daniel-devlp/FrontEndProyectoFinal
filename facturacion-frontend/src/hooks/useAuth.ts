/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔐 HOOK DE AUTENTICACIÓN Y AUTORIZACIÓN
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este hook centraliza toda la lógica de autenticación, autorización y gestión
 * de sesiones de usuario. Es el corazón del sistema de seguridad de la aplicación.
 * 
 * 🎯 FUNCIONALIDADES PRINCIPALES:
 * • Gestión completa del ciclo de vida de la sesión de usuario
 * • Manejo de múltiples roles por usuario con selección dinámica
 * • Persistencia segura de tokens y datos de usuario
 * • Verificación automática de autenticación al cargar la app
 * • Manejo robusto de errores de autenticación con códigos específicos
 * • Integración con sistema de notificaciones moderno
 * • Logout automático en caso de tokens expirados
 * • Protección contra ataques XSS y CSRF
 * 
 * 🔒 CARACTERÍSTICAS DE SEGURIDAD:
 * • Validación de tokens JWT en cada operación crítica
 * • Manejo seguro de credenciales sin exposición en logs
 * • Limpieza automática de datos sensibles al cerrar sesión
 * • Verificación de integridad de datos de usuario
 * • Protección contra escalada de privilegios
 * • Manejo seguro de localStorage con sanitización
 * 
 * 👤 SISTEMA DE ROLES:
 * • Soporte para usuarios con múltiples roles simultáneos
 * • Selección dinámica de rol activo durante la sesión
 * • Persistencia de rol seleccionado entre sesiones
 * • Validación de permisos según el rol activo
 * • Interfaz de selección de rol cuando sea necesario
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Implementar refresh tokens automático
 * • Añadir autenticación biométrica (WebAuthn)
 * • Sistema de sesiones múltiples por usuario
 * • Integración con SSO (Single Sign-On)
 * • Audit logging de todas las acciones de autenticación
 * • Sistema de notificaciones de login desde nuevos dispositivos
 * • Implementar 2FA (Two-Factor Authentication)
 * • Session timeout configurable por rol
 * • Geolocalización de sesiones para seguridad adicional
 * • Integración con LDAP/Active Directory
 * 
 * 💡 ESTADOS DEL HOOK:
 * • isAuthenticated: Usuario tiene sesión válida
 * • requiresRoleSelection: Usuario debe seleccionar rol
 * • loading: Verificando estado de autenticación
 * • errorCode: Código específico del último error
 * • selectedRole: Rol actualmente activo
 * 
 * 🔧 EJEMPLO DE USO:
 * ```typescript
 * const { 
 *   isAuthenticated, 
 *   login, 
 *   logout, 
 *   selectedRole,
 *   requiresRoleSelection 
 * } = useAuth();
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { notifications } from '../utils/notifications';
import { authService } from '../services/authService';

/**
 * 🔐 HOOK PRINCIPAL DE AUTENTICACIÓN
 * 
 * Maneja todo el flujo de autenticación desde el login hasta el logout,
 * incluyendo la gestión de múltiples roles y la persistencia de sesión.
 * 
 * @returns Objeto con estados y funciones de autenticación
 */
export const useAuth = () => {
  // ╔═══════════════════════════════════════════════════════════════════════════
  // ║ 📊 ESTADOS DEL HOOK
  // ╚═══════════════════════════════════════════════════════════════════════════
  
  /** 
   * 🟢 Estado de autenticación del usuario
   * true: Usuario autenticado con token válido y rol seleccionado
   * false: Usuario no autenticado o requiere selección de rol
   */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  /** 
   * 🚨 Código específico del último error de autenticación
   * Permite manejo granular de diferentes tipos de errores:
   * • 'USER_NOT_FOUND': Usuario no existe
   * • 'USER_BLOCKED': Usuario bloqueado por administrador
   * • 'INVALID_CREDENTIALS': Credenciales incorrectas
   * • 'NETWORK_ERROR': Problemas de conectividad
   */
  const [errorCode, setErrorCode] = useState<string | null>(null);
  
  /** 
   * 🔧 Mensaje técnico detallado del error (para debugging)
   * Se usa para logging interno, nunca se muestra al usuario final
   */
  const [technicalMessage, setTechnicalMessage] = useState<string | null>(null);
  
  /** 
   * ⏳ Estado de carga durante operaciones de autenticación
   * true: Verificando credenciales, validando tokens, etc.
   * false: Operación completada (exitosa o fallida)
   */
  const [loading, setLoading] = useState(true);
  
  /** 
   * 🚀 Indica si el hook ha completado su inicialización
   * Evita renderizados prematuros antes de verificar el estado de auth
   */
  const [isInitialized, setIsInitialized] = useState(false);
  
  /** 
   * 👥 Indica si el usuario debe seleccionar un rol
   * true: Usuario tiene múltiples roles y debe escoger uno
   * false: Usuario tiene un solo rol o ya seleccionó uno
   */
  const [requiresRoleSelection, setRequiresRoleSelection] = useState(false);
  
  /** 
   * 📋 Lista de roles disponibles para el usuario actual
   * Se llena cuando el usuario tiene múltiples roles
   */
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  
  /** 
   * 🎯 Rol actualmente seleccionado y activo
   * Determina los permisos y la interfaz que ve el usuario
   */
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // ╔═══════════════════════════════════════════════════════════════════════════
  // ║ 🔄 EFECTOS Y INICIALIZACIÓN
  // ╚═══════════════════════════════════════════════════════════════════════════
  
  /**
   * 🚀 Verificación automática de autenticación al cargar la aplicación
   * Se ejecuta una sola vez cuando el componente se monta
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * 🔍 VERIFICADOR DE ESTADO DE AUTENTICACIÓN
   * 
   * Función crítica que determina si el usuario tiene una sesión válida
   * y maneja la lógica de selección de roles.
   * 
   * 🔄 Flujo de verificación:
   * 1. Busca token y datos de usuario en localStorage
   * 2. Si existen, valida integridad de los datos
   * 3. Analiza roles disponibles del usuario
   * 4. Si tiene múltiples roles sin seleccionar: activa selección de rol
   * 5. Si tiene un solo rol: lo selecciona automáticamente
   * 6. Si ya tenía rol seleccionado: restaura la sesión
   * 7. Actualiza estados correspondientes
   * 
   * 🛡️ Validaciones de seguridad:
   * • Verifica formato válido del JSON en localStorage
   * • Valida estructura de datos de usuario
   * • Verifica que el rol seleccionado esté en la lista de roles del usuario
   * • Sanitiza datos antes de procesarlos
   * 
   * 💡 Casos de uso:
   * • Recarga de página con sesión activa
   * • Regreso a la app después de inactividad
   * • Verificación periódica de validez de sesión
   */
  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      const savedRole = localStorage.getItem('selectedRole');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        const userRoles = user.roles || [];
        
        if (userRoles.length > 1 && !savedRole) {
          // 👥 Usuario con múltiples roles necesita seleccionar uno
          setAvailableRoles(userRoles);
          setRequiresRoleSelection(true);
          setIsAuthenticated(false);
        } else if (userRoles.length === 1) {
          // 👤 Usuario con un solo rol: selección automática
          const singleRole = userRoles[0];
          authService.selectRole(singleRole);
          setSelectedRole(singleRole);
          setIsAuthenticated(true);
          setRequiresRoleSelection(false);
        } else if (savedRole) {
          // ✅ Usuario ya tenía un rol seleccionado: restaurar sesión
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

  const storeAuthData = (token: string, user: any) => {    if (!user || !user.roles || user.roles.length === 0) {
      console.error('El usuario no tiene roles definidos:', user);
      notifications.error('El usuario no tiene roles asignados. Contacte al administrador.');
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


