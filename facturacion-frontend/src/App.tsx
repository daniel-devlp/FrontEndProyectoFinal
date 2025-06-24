import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import HomeAdmin from './pages/admin/HomeAdmin';
import HomeUser from './pages/user/HomeUser';
import UserDashboard from './pages/user/UserDashboard';
import UserClientsCRUD from './pages/user/UserClientsCRUD';
import UserProductsView from './pages/user/UserProductsView';
import UserInvoices from './pages/user/UserInvoices';
import InvoiceCreate from './pages/invoices/InvoiceCreatePage';
import UsersCRUD from './pages/admin/UsersCRUD';
import RolesCRUD from './pages/admin/RolesCRUD';
import ProductsCRUD from './pages/product/ProductsCRUD';
import ClientsCRUD from './pages/client/ClientsCRUD';
import Invoices from './pages/invoices/Invoices';
import RoleProtectedRoute from '../src/components/common/RoleProtectedRoute';
import './assets/styles/App.css';
import './assets/styles/Navbar.css';
import './assets/styles/LoginPage.css';
import './assets/styles/HomeAdmin.css';
import './assets/styles/HomeUser.css';
import './assets/styles/InvoiceCreate.css';
import './assets/styles/UsersCRUD.css';
import './assets/styles/RolesCRUD.css';
import './assets/styles/ProductsCRUD.css';
import './assets/styles/Toast.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, isInitialized, loading, selectedRole } = useAuth();

  // Asegurar scroll natural sin interferencias
  useEffect(() => {
    // Habilitar scroll vertical de forma natural
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
  }, []);

  // Mostrar loading mientras se inicializa
  if (!isInitialized || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '20px',
        color: '#667eea',
        fontWeight: '600'
      }}>
        <div>Cargando aplicación...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
     <ToastContainer
  position="top-center"
  autoClose={5000}        // ✅ 5 segundos automático
  hideProgressBar={false} // ✅ Muestra barra de progreso
  closeOnClick={true}     // ✅ Cierre manual con clic
  pauseOnHover={true}     // ✅ Pausa al hacer hover
  draggable={true}        // ✅ Arrastrable
  theme="colored"         // ✅ Tema con colores
/>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to={selectedRole === "Administrator" ? "/admin" : "/user"} replace /> : 
            <LoginPage />
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? (selectedRole === "Administrator" ? "/admin" : "/user") : "/login"} replace />
          } 
        />
        {/* Rutas de Administrador */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["Administrator"]}>
              <HomeAdmin />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={["Administrator"]}>
              <UsersCRUD />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <RoleProtectedRoute allowedRoles={["Administrator"]}>
              <RolesCRUD />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RoleProtectedRoute allowedRoles={["Administrator"]}>
              <ProductsCRUD />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <RoleProtectedRoute allowedRoles={["Administrator"]}>
              <ClientsCRUD />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/invoices"
          element={
            <RoleProtectedRoute allowedRoles={["Administrator"]}>
              <Invoices />
            </RoleProtectedRoute>
          }
        />

        {/* Rutas de Usuario Normal */}
        <Route
          path="/user"
          element={
            <RoleProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/user/clients"
          element={
            <RoleProtectedRoute allowedRoles={["user"]}>
              <UserClientsCRUD />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/user/products"
          element={
            <RoleProtectedRoute allowedRoles={["user"]}>
              <UserProductsView />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/user/invoices"
          element={
            <RoleProtectedRoute allowedRoles={["user"]}>
              <UserInvoices />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/user/invoices/create"
          element={
            <RoleProtectedRoute allowedRoles={["user"]}>
              <InvoiceCreate />
            </RoleProtectedRoute>
          }
        />

        {/* Rutas compartidas */}
        <Route
          path="/invoices/create"
          element={
            <RoleProtectedRoute allowedRoles={["Administrator", "user"]}>
              <InvoiceCreate />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/factura/nueva"
          element={
            <RoleProtectedRoute allowedRoles={["Administrator", "user"]}>
              <InvoiceCreate />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <RoleProtectedRoute allowedRoles={["Administrator", "user"]}>
              <Invoices />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
