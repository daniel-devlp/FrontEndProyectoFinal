/**
 * Componente UserDashboard
 * 
 * Un panel de navegación integral diseñado específicamente para usuarios regulares.
 * Este componente proporciona una interfaz estructurada con tarjetas de navegación que
 * guían a los usuarios a sus funcionalidades disponibles dentro del sistema.
 * 
 * Características Principales:
 * - Tarjetas de navegación visual para todas las funciones del usuario
 * - Categorización clara de acciones disponibles
 * - Interfaz codificada por colores para mejor UX
 * - Diseño de diseño de tarjetas responsivo
 * - Conciencia del contexto de permisos del usuario
 * 
 * Experiencia del Usuario:
 * - Navegación intuitiva basada en tarjetas
 * - Iconos visuales para reconocimiento rápido
 * - Descripciones claras para cada función
 * - Efectos de hover y retroalimentación visual
 * - Diseño organizado por tipo de función
 * 
 * Implementación Técnica:
 * - Integración de navegación de React Router
 * - Renderizado dinámico de tarjetas desde configuración
 * - Diseño de cuadrícula CSS responsivo
 * - Elementos visuales temáticos de color
 * - Optimizado para accesibilidad
 * 
 * Estructura de Navegación:
 * - Gestión de Clientes: Operaciones CRUD para clientes
 * - Catálogo de Productos: Visualización de productos de solo lectura
 * - Gestión de Facturas: Ver y gestionar facturas
 * - Creación de Facturas: Generación de nuevas facturas
 * 
 * Permisos del Usuario:
 * - Limitado a funcionalidades de nivel de usuario
 * - Sin acceso administrativo
 * - Restricciones apropiadas comunicadas claramente
 * 
 * @componente
 * @ejemplo
 * ```tsx
 * // Dentro de una ruta protegida para usuarios autenticados
 * <UserDashboard />
 * ```
 * 
 * Estilizado:
 * - Usa UserDashboard.css para estilos específicos del componente
 * - Diseño basado en tarjetas con efectos de hover
 * - Elementos de navegación codificados por colores
 * - Diseño responsivo para varios tamaños de pantalla
 * 
 * Mejoras Futuras:
 * - Permisos dinámicos basados en el rol del usuario
 * - Tarjetas de resumen de actividad reciente
 * - Estadísticas rápidas para datos del usuario
 * - Preferencias de panel personalizadas
 * - Acciones de acceso directo para tareas comunes
 * - Indicadores de progreso para tareas del usuario
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import '../../assets/styles/UserDashboard.css';

/**
 * Componente funcional UserDashboard
 * 
 * Renderiza un panel de navegación con tarjetas organizadas para todas las funciones del usuario.
 * Proporciona acceso claro a gestión de clientes, productos y características de facturación.
 * 
 * @retorna {JSX.Element} Interfaz completa del panel del usuario
 */
const UserDashboard: React.FC = () => {
  // Hook de navegación para enrutamiento programático
  const navigate = useNavigate();

  /**
   * Dashboard navigation cards configuration
   * 
   * Defines all available user functions with visual and navigation properties.
   * Each card includes title, description, icon, path, and color theming.
   */
  const dashboardCards = [
    {
      title: 'Gestión de Clientes',
      description: 'Visualizar catálogo de clientes disponibles',
      icon: '👥',
      path: '/user/clients',
      color: '#3498db'
    },
    {
      title: 'Productos',
      description: 'Visualizar catálogo de productos disponibles',
      icon: '📦',
      path: '/user/products',
      color: '#e67e22'
    },
    {
      title: 'Facturas',
      description: 'Ver y gestionar facturas existentes',
      icon: '📋',
      path: '/user/invoices',
      color: '#9b59b6'
    },
    {
      title: 'Crear Factura',
      description: 'Generar nuevas facturas para clientes',
      icon: '➕',
      path: '/user/invoices/create',
      color: '#27ae60'
    }
  ];

  return (
    <div className="user-dashboard">
      {/* Componente de Navegación */}
      <Navbar />
      
      <div className="dashboard-content">
        {/* Dashboard Header */}
        {/* Welcome message and context for user navigation */}
        <div className="dashboard-header">
          <h1>Panel de Usuario</h1>
          <p>Bienvenido al sistema de facturación. Selecciona una opción para comenzar.</p>
        </div>

        {/* Navigation Cards Grid */}
        {/* 
          Dynamic rendering of navigation cards with click handlers.
          Each card provides visual feedback and clear navigation paths.
        */}
        <div className="dashboard-cards">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="dashboard-card"
              onClick={() => navigate(card.path)}
              style={{ borderLeft: `4px solid ${card.color}` }}
            >
              {/* Card Icon */}
              <div className="card-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              
              {/* Card Content */}
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              
              {/* Navigation Arrow */}
              <div className="card-arrow" style={{ color: card.color }}>
                →
              </div>
            </div>
          ))}
        </div>

        {/* User Information Section */}
        {/* 
          Componente educativo que explica los permisos y limitaciones del usuario.
          Helps users understand their role within the system.
        */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h4>Acceso Restringido</h4>
              <p>Como usuario, tienes acceso limitado a funcionalidades específicas del sistema</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
