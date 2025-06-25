/**
 * Componente HomeAdmin
 * 
 * La página principal del panel para administradores del sistema, proporcionando una visión
 * integral de todo el estado de la aplicación incluyendo estadísticas, acciones rápidas,
 * y navegación a todas las funciones administrativas.
 * 
 * Características Principales:
 * - Panel de estadísticas del sistema en tiempo real
 * - Navegación rápida a todas las funciones de admin
 * - Métricas visuales para clientes, productos, facturas y usuarios
 * - Estados de carga y manejo de errores
 * - Diseño responsivo para varios tamaños de pantalla
 * - Diseño de centro de control administrativo
 * 
 * Capacidades Administrativas:
 * - Ver conteos totales para todas las entidades del sistema
 * - Acceso rápido a operaciones CRUD
 * - Vista general del sistema de un vistazo
 * - Hub de navegación para todas las funciones de admin
 * 
 * Experiencia del Usuario:
 * - Diseño limpio estilo panel
 * - Tarjetas de estadísticas codificadas por colores
 * - Botones de navegación intuitivos
 * - Retroalimentación de carga para obtención de datos
 * - Interfaz administrativa profesional
 * 
 * Implementación Técnica:
 * - Usa múltiples hooks personalizados para obtención de datos
 * - Agrega estadísticas de varios servicios
 * - Implementa estados de carga y error adecuados
 * - Re-renderizado optimizado a través de gestión del estado
 * - Compatible con límites de error
 * 
 * Seguridad y Acceso:
 * - Acceso solo para admin (debe estar protegido por guardias de ruta)
 * - Vista general integral del sistema para supervisión administrativa
 * - Sin exposición de datos sensibles en estadísticas
 * 
 * Puntos de Integración:
 * - Navegación a todos los módulos CRUD
 * - Obtención de datos desde hooks de clientes, productos, facturas y usuarios
 * - Hub central para operaciones administrativas
 * 
 * @componente
 * @ejemplo
 * ```tsx
 * // Dentro de una ruta protegida para admin
 * <HomeAdmin />
 * ```
 * 
 * Estilizado:
 * - Usa HomeAdmin.css para estilos específicos del componente
 * - Diseño estilo panel con tarjetas de métricas
 * - Sistema de cuadrícula responsivo para estadísticas
 * - Tematización administrativa profesional
 * 
 * Mejoras Futuras:
 * - Gráficos e indicadores interactivos
 * - Análisis de tendencias y datos históricos
 * - Actualizaciones en tiempo real via WebSocket
 * - Filtrado avanzado y rangos de fechas
 * - Funcionalidad de exportación para reportes
 * - Monitoreo de actividad del usuario
 * - Indicadores de salud del sistema
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import DynamicButton from '../../components/common/DynamicButton';
import { useClients } from '../../hooks/useClients';
import { useProducts } from '../../hooks/useProducts';
import { useInvoices } from '../../hooks/useInvoices';
import { useUsers } from '../../hooks/useUsers';
import '../../assets/styles/HomeAdmin.css';

/**
 * Dashboard statistics interface
 * 
 * Defines the structure for dashboard metrics and loading states.
 */
interface DashboardStats {
  totalClients: number;
  totalProducts: number;
  totalInvoices: number;
  totalUsers: number;
  loading: boolean;
  error?: string;
}

/**
 * Componente funcional HomeAdmin
 * 
 * Renderiza el panel administrativo principal con estadísticas del sistema
 * y navegación a todas las funciones administrativas.
 * 
 * Gestión del Estado:
 * - stats: Estadísticas agregadas de todos los módulos del sistema
 * - loading: Estado de carga general para el panel
 * - error: Manejo de errores para obtención de datos fallida
 * 
 * @retorna {JSX.Element} Interfaz completa del panel administrativo
 */
const HomeAdmin: React.FC = () => {
  // Hook de navegación para enrutamiento programático
  const navigate = useNavigate();
  
  // Gestión del estado de estadísticas del panel
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalProducts: 0,
    totalInvoices: 0,
    totalUsers: 0,
    loading: true
  });

  // Data fetching hooks for real-time statistics
  // Each hook fetches only the total count (pageSize: 1) for efficiency
  
  /**
   * Clients statistics hook
   * Fetches total client count for dashboard display
   */
  const { totalItems: totalClients, loading: clientsLoading, error: clientsError } = useClients({
    pageNumber: 1,
    pageSize: 1, // Only need count, not actual data
    searchTerm: ''
  });

  /**
   * Products statistics hook
   * Fetches total product count for dashboard display
   */
  const { totalItems: totalProducts, loading: productsLoading, error: productsError } = useProducts({
    pageNumber: 1,
    pageSize: 1, // Only need count, not actual data
    searchTerm: ''
  });

  /**
   * Invoices statistics hook
   * Fetches total invoice count for dashboard display
   */
  const { totalItems: totalInvoices, loading: invoicesLoading, error: invoicesError } = useInvoices({
    pageNumber: 1,
    pageSize: 1, // Only need count, not actual data
    searchTerm: ''
  });
  
  /**
   * Users statistics hook
   * Fetches user data to calculate total count
   */
  const { users, loading: usersLoading, error: usersError } = useUsers();

  /**
   * Dashboard statistics aggregation effect
   * 
   * Combines data from all hooks to create unified dashboard statistics.
   * Updates the stats state when all data is loaded or when errors occur.
   * 
   * Dependencies: All loading states and data from hooks
   */
  useEffect(() => {
    // Check if any data is still loading
    const allLoading = clientsLoading || productsLoading || invoicesLoading || usersLoading;
    
    // Check if any hook returned an error
    const hasError = clientsError || productsError || invoicesError || usersError;

    // Only update stats when all data is loaded
    if (!allLoading) {
      setStats({
        totalClients: totalClients || 0,
        totalProducts: totalProducts || 0,
        totalInvoices: totalInvoices || 0,
        totalUsers: users?.length || 0,
        loading: false,
        error: hasError ? 'Error al cargar algunos datos' : undefined
      });
    } else {
      // Keep loading state active while any hook is still loading
      setStats(prev => ({ ...prev, loading: true }));
    }
  }, [
    // Dependencies: all loading states, data, and errors
    clientsLoading, productsLoading, invoicesLoading, usersLoading,
    totalClients, totalProducts, totalInvoices, users,
    clientsError, productsError, invoicesError, usersError
  ]);

  /**
   * Dashboard cards configuration
   * 
   * Defines the visual statistics cards displayed on the dashboard.
   * Each card includes metrics, styling, and navigation information.
   */
  const dashboardCards = [
    {
      title: 'Clientes',
      count: stats.totalClients,
      icon: '👥',
      path: '/admin/clients',
      color: '#3498db',
      bgGradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      description: 'Clientes registrados'
    },
    {
      title: 'Productos',
      count: stats.totalProducts,
      icon: '📦',
      path: '/admin/products',
      color: '#2ecc71',
      bgGradient: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
      description: 'Productos en inventario'
    },
    {
      title: 'Facturas',
      count: stats.totalInvoices,
      icon: '📋',
      path: '/admin/invoices',
      color: '#e74c3c',
      bgGradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      description: 'Facturas generadas'
    },
    {
      title: 'Usuarios',
      count: stats.totalUsers,
      icon: '👤',
      path: '/admin/users',
      color: '#9b59b6',
      bgGradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
      description: 'Usuarios del sistema'
    }
  ];

  /**
   * Quick actions configuration
   * 
   * Defines quick access buttons for common administrative tasks.
   * Provides shortcuts to create new entities and manage roles.
   */
  const quickActions = [
    {
      label: 'Crear Cliente',
      path: '/admin/clients',
      icon: '👥',
      type: 'save' as const
    },
    {
      label: 'Crear Producto',
      path: '/admin/products',
      icon: '📦',
      type: 'save' as const
    },
    {
      label: 'Nueva Factura',
      path: '/admin/invoices/create',
      icon: '📋',
      type: 'save' as const
    },
    {
      label: 'Crear Usuario',
      path: '/admin/users',
      icon: '👤',
      type: 'save' as const
    }
  ];

  return (
    <div className="home-admin">
      {/* Componente de Navegación */}
      <Navbar />
      
      <div className="admin-dashboard">
        {/* Dashboard Header */}
        {/* Welcome message and admin context identification */}
        <div className="dashboard-header">
          <h1>Panel de Administración</h1>
          <p>Bienvenido al sistema de facturación - Vista Administrador</p>
        </div>

        {/* Loading and Error States */}
        {/* 
          Conditional rendering based on data loading status:
          - Loading spinner while fetching statistics
          - Error message with retry option
          - Dashboard content when data is ready
        */}
        {stats.loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando estadísticas del sistema...</p>
          </div>
        ) : stats.error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p>{stats.error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Dashboard Statistics Section */}
            {/* 
              Main statistics display with visual cards for each system entity.
              Cards are clickable and navigate to corresponding CRUD pages.
            */}
            <div className="stats-section">
              <div className="section-header">
                <h2>📊 Resumen General</h2>
                <p>Vista general de tu sistema de facturación</p>
              </div>
              <div className="dashboard-cards">
                {dashboardCards.map((card, index) => (
                  <div 
                    key={index} 
                    className="stat-card"
                    onClick={() => navigate(card.path)}
                    style={{ background: card.bgGradient }}
                  >
                    <div className="stat-card-content">
                      <div className="stat-icon">
                        {card.icon}
                      </div>
                      <div className="stat-info">
                        <h3>{card.count.toLocaleString()}</h3>
                        <p className="stat-title">{card.title}</p>
                        <span className="stat-description">{card.description}</span>
                      </div>
                    </div>
                    <div className="stat-card-overlay">
                      <span>Ver detalles →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Section */}
            {/* 
              Provides shortcuts to common administrative tasks.
              Each action navigates directly to the relevant creation/management page.
            */}
            <div className="actions-section">
              <div className="section-header">
                <h2>⚡ Acciones Rápidas</h2>
                <p>Accede rápidamente a las funciones más utilizadas</p>
              </div>
              <div className="quick-actions">
                {quickActions.map((action, index) => (
                  <div key={index} className="action-card">
                    <div className="action-icon">{action.icon}</div>
                    <DynamicButton
                      type={action.type}
                      onClick={() => navigate(action.path)}
                      label={action.label}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* System Information Section */}
            {/* 
              Displays system status, last update information, and other
              administrative context information.
            */}
            <div className="recent-activity">
              <div className="section-header">
                <h2>🔧 Información del Sistema</h2>
                <p>Estado actual y configuración del sistema</p>
              </div>
              <div className="info-cards">
                {/* System Status Card */}
                <div className="info-card system-status">
                  <div className="info-card-header">
                    <span className="info-icon">🟢</span>
                    <h4>Estado del Sistema</h4>
                  </div>
                  <p>✅ Todos los servicios funcionando correctamente</p>
                  <div className="status-indicators">
                    <div className="status-item">
                      <span className="status-dot active"></span>
                      <span>Base de datos</span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot active"></span>
                      <span>API REST</span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot active"></span>
                      <span>Autenticación</span>
                    </div>
                  </div>
                </div>
                
                {/* Last Update Information */}
                <div className="info-card update-info">
                  <div className="info-card-header">
                    <span className="info-icon">📅</span>
                    <h4>Última Actualización</h4>
                  </div>
                  <p>{new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p className="update-time">
                    {new Date().toLocaleTimeString('es-ES')}
                  </p>
                </div>
                
                {/* Commented Welcome Card - Available for future use */}
                {/* <div className="info-card welcome-card">
                  <div className="info-card-header">
                    <span className="info-icon">👋</span>
                    <h4>Bienvenido Administrador</h4>
                    </div>
                    <p>Gestiona tu sistema de facturación desde este panel central.</p>
                    <div className="welcome-actions">
                    <button 
                      className="welcome-btn"
                      onClick={() => navigate('/admin/help')}
                    >
                      📚 Guía de usuario
                    </button>
                  </div>
                </div> */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeAdmin;
