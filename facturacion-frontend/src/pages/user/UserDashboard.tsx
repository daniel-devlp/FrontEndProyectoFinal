import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import '../../assets/styles/UserDashboard.css';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Gestión de Clientes',
      description: 'Crear, editar y gestionar información de clientes',
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
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Panel de Usuario</h1>
          <p>Bienvenido al sistema de facturación. Selecciona una opción para comenzar.</p>
        </div>

        <div className="dashboard-cards">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="dashboard-card"
              onClick={() => navigate(card.path)}
              style={{ borderLeft: `4px solid ${card.color}` }}
            >
              <div className="card-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="card-arrow" style={{ color: card.color }}>
                →
              </div>
            </div>
          ))}
        </div>

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
