/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧭 COMPONENTE DE NAVEGACIÓN PRINCIPAL
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este componente implementa la barra de navegación principal de la aplicación,
 * proporcionando acceso a todas las secciones según el rol del usuario.
 * 
 * 🎯 FUNCIONALIDADES PRINCIPALES:
 * • Navegación adaptativa según roles y permisos del usuario
 * • Menú responsive para dispositivos móviles y desktop
 * • Indicador de estado de conexión online/offline
 * • Información del usuario autenticado en tiempo real
 * • Logout seguro con limpieza de sesión
 * • Manejo de teclado para accesibilidad (ESC para cerrar menú)
 * • Cierre automático de menú al cambiar de ruta
 * 
 * 🔧 CARACTERÍSTICAS TÉCNICAS:
 * • Integración con sistema de autenticación y autorización
 * • Manejo de eventos de conectividad del navegador
 * • Responsive design con breakpoints para móviles
 * • Animaciones CSS para mejor experiencia de usuario
 * • Event listeners optimizados con cleanup automático
 * • Integración con React Router para navegación SPA
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Notificaciones en tiempo real integradas en la navbar
 * • Avatar personalizable del usuario con foto de perfil
 * • Breadcrumbs dinámicos según la ruta actual
 * • Búsqueda global con autocompletado
 * • Accesos directos configurables por usuario
 * • Modo oscuro/claro con toggle
 * • Indicadores de badges para notificaciones pendientes
 * • Menú contextual con acciones rápidas
 * • Integración con sistemas de help desk
 * • Shortcuts de teclado personalizables
 * • Multi-idioma con selector de idioma
 * • Integración con sistemas de chat interno
 * 
 * 💡 ESTRUCTURA DEL MENÚ:
 * ```
 * Admin: Dashboard → Users → Roles → Clients → Products → Invoices
 * User:  Dashboard → Clients → Products → Invoices
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { notifications } from '../../utils/notifications';
import './../../assets/styles/Navbar.css';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

 /**
 * 🧭 COMPONENTE PRINCIPAL DE NAVEGACIÓN
 * 
 * Renderiza la barra de navegación principal con menús adaptativos,
 * información del usuario y controles de sesión.
 * 
 * @returns {JSX.Element} Elemento JSX de la barra de navegación
 */
const Navbar: React.FC = () => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 ESTADOS DEL COMPONENTE
  // ═══════════════════════════════════════════════════════════════════════════════

  /** 👤 Nombre del usuario autenticado */
  const [username, setUsername] = useState('Usuario');
  
  /** 📱 Estado del menú móvil (abierto/cerrado) */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  /** 🌐 Estado de conectividad a internet */
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  /** 🎭 Datos de autenticación y permisos del usuario actual */
  const { selectedRole, canAccess } = useAuth();
  
  /** 📍 Ubicación actual en la aplicación */
  const location = useLocation();

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🚀 EFECTOS Y INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * 👤 EFECTO PARA CARGAR INFORMACIÓN DEL USUARIO
   * 
   * Se ejecuta una vez al montar el componente para obtener el nombre
   * del usuario autenticado desde el servicio de autenticación.
   */
  useEffect(() => {
    /**
     * 🔄 Función asíncrona para obtener datos del usuario
     * Maneja errores de forma elegante y proporciona fallbacks
     */
    const fetchUsername = async () => {
      try {
        const data = await authService.getCurrentUser();
        setUsername(data.userName || 'Usuario');
      } catch (error) {
        // 🔍 Log para debugging sin exponer información sensible
        console.error('Error fetching username:', error);
        notifications.error('Error al obtener información del usuario');
        setUsername('Usuario'); // 🔄 Fallback en caso de error
      }
    };

    fetchUsername();
  }, []);

  // Monitorear estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Cerrar menú con ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);
  const handleLogout = async () => {
    try {
      await authService.logout();
      notifications.success('Sesión cerrada exitosamente');
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      notifications.error('Error al cerrar sesión');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getRoleDisplayName = (role: string | null) => {
    if (!role) return '';
    switch (role.toLowerCase()) {
      case 'administrator':
        return 'Admin';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  const getMenuItems = () => {
    if (canAccess(['Administrator'])) {
      // Menú para Administrador
      return [
        { path: '/admin/clients', label: 'Clientes', icon: '👥' },
        { path: '/admin/products', label: 'Productos', icon: '📦' },
        { path: '/admin/users', label: 'Usuarios', icon: '👤' },
        //{ path: '/admin/roles', label: 'Roles', icon: '🔑' },
        { path: '/admin/invoices', label: 'Facturas', icon: '📋' },
        { path: '/factura/nueva', label: 'Crear Factura', icon: '➕' }
      ];
    } else if (canAccess(['user'])) {
      // Menú para Usuario normal
      return [
        { path: '/user/clients', label: 'Clientes', icon: '👥' },
        { path: '/user/products', label: 'Productos', icon: '📦' },
        { path: '/user/invoices', label: 'Facturas', icon: '📋' },
        { path: '/user/invoices/create', label: 'Crear Factura', icon: '➕' }
      ];
    }
    return [];
  };

  const getDashboardPath = () => {
    if (canAccess(['Administrator'])) {
      return '/admin';
    } else if (canAccess(['user'])) {
      return '/user/dashboard';
    }
    return '/';
  };

  const menuItems = getMenuItems();
  const dashboardPath = getDashboardPath();
  
  return (
    <>
      {/* Botón hamburguesa para móviles */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
      </button>

      {/* Overlay para cerrar el menú en móviles */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={closeMenu}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar/Navbar */}
      <div className={`sidebar ${isMenuOpen ? 'mobile-open' : ''}`}>
        {/* Header del sidebar */}
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="username">{username}</p>
              <p className="user-role">
                {getRoleDisplayName(selectedRole)}
              </p>
              <p className={`user-status ${isOnline ? 'online' : 'offline'}`}>
                <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></span>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          <h2 
            className="sidebar-title"
            onClick={() => {
              window.location.href = dashboardPath;
              closeMenu();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                window.location.href = dashboardPath;
                closeMenu();
              }
            }}
          >
            {canAccess(['Administrator']) ? '🏢 Admin Panel' : '👤 Panel Usuario'}
          </h2>
        </div>
        
        {/* Menú de navegación */}
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          <ul className="menu-list">
            {menuItems.map((item, index) => (
              <li key={index} className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}>
                <Link 
                  to={item.path} 
                  className="menu-link"
                  onClick={closeMenu}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <span className="menu-icon" aria-hidden="true">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Botón de logout */}
        <div className="sidebar-footer">
          <button 
            onClick={() => {
              handleLogout();
              closeMenu();
            }} 
            className="logout-button"
            aria-label="Cerrar sesión"
          >
            <span className="logout-icon" aria-hidden="true">🚪</span>
            <span className="logout-text">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;



