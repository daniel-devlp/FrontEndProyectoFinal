import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './../../assets/styles/Navbar.css';
import { authService } from '../../services/authService';


const Navbar: React.FC = () => {
  const [username, setUsername] = useState('Joe Doe');

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const data = await authService.getCurrentUser();
        setUsername(data.userName || 'Joe Doe'); // Usar 'userName' en lugar de 'username'
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername('Joe Doe'); // Default to 'Joe Doe' in case of error
      }
    };

    fetchUsername();
  }, []);
const handleLogout = async () => {
  try {
    await authService.logout();
    window.location.href = "/"; // Redirige a la página de inicio de sesión después de cerrar sesión
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
 return (
  <div className="sidebar">
    <div className="user-info">
      <p>{username}</p>
      <p>
        Online <span className="status-dot"></span>
      </p>
    </div>
    <h2 onClick={() => window.location.href = '/admin'}>General</h2>
    <ul>
      <li className="menu-item">
        <Link to="/admin/clients">Clientes</Link>
      </li>
      <li className="menu-item">
        <Link to="/admin/products">Productos</Link>
      </li>
      <li className="menu-item">
        <Link to="/admin/users">Usuarios</Link>
      </li>
      <li className="menu-item">
        <Link to="/admin/invoices">Facturas</Link>
      </li>
    </ul>
    <div className="logout">
      <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
    </div>
  </div>
);
};

export default Navbar;
