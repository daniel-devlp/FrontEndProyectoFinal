import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import DynamicButton from '../../components/common/DynamicButton';
import { useClients } from '../../hooks/useClients';
import { useProducts } from '../../hooks/useProducts';
import { useInvoices } from '../../hooks/useInvoices';
import { useUsers } from '../../hooks/useUsers';
import '../../assets/styles/HomeAdmin.css';

interface DashboardStats {
  totalClients: number;
  totalProducts: number;
  totalInvoices: number;
  totalUsers: number;
  loading: boolean;
  error?: string;
}

const HomeAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalProducts: 0,
    totalInvoices: 0,
    totalUsers: 0,
    loading: true
  });

  // Usar hooks para obtener datos reales
  const { totalItems: totalClients, loading: clientsLoading, error: clientsError } = useClients({
    pageNumber: 1,
    pageSize: 1,
    searchTerm: ''
  });

  const { totalItems: totalProducts, loading: productsLoading, error: productsError } = useProducts({
    pageNumber: 1,
    pageSize: 1,
    searchTerm: ''
  });

  const { totalItems: totalInvoices, loading: invoicesLoading, error: invoicesError } = useInvoices({
    pageNumber: 1,
    pageSize: 1,
    searchTerm: ''
  });
  const { users, loading: usersLoading, error: usersError } = useUsers();useEffect(() => {
    const allLoading = clientsLoading || productsLoading || invoicesLoading || usersLoading;
    const hasError = clientsError || productsError || invoicesError || usersError;

    if (!allLoading) {      setStats({
        totalClients: totalClients || 0,
        totalProducts: totalProducts || 0,
        totalInvoices: totalInvoices || 0,
        totalUsers: users?.length || 0,
        loading: false,
        error: hasError ? 'Error al cargar algunos datos' : undefined
      });
    } else {
      setStats(prev => ({ ...prev, loading: true }));
    }  }, [
    clientsLoading, productsLoading, invoicesLoading, usersLoading,
    totalClients, totalProducts, totalInvoices, users,
    clientsError, productsError, invoicesError, usersError
  ]);
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
      <Navbar />
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Panel de Administración</h1>
          <p>Bienvenido al sistema de facturación - Vista Administrador</p>
        </div>        {stats.loading ? (
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

            <div className="recent-activity">
              <div className="section-header">
                <h2>🔧 Información del Sistema</h2>
                <p>Estado actual y configuración del sistema</p>
              </div>
              <div className="info-cards">
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
