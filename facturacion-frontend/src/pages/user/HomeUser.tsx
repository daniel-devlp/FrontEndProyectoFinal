import React from 'react';
import Navbar from '../../components/common/Navbar';
import '../../assets/styles/HomeUser.css';

const HomeUser: React.FC = () => {
  return (
    <div className="home-user">
      <Navbar />
      <div className="user-dashboard">
        <h1>Bienvenido, Usuario</h1>
        <div className="dashboard-cards">
          <div className="card">
            <h3>Perfil</h3>
            <p>Gestión de tu perfil</p>
          </div>
          <div className="card">
            <h3>Facturas</h3>
            <p>Consulta tus facturas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeUser;
