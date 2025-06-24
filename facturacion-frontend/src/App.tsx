import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import HomeAdmin from './pages/admin/HomeAdmin';
import HomeUser from './pages/user/HomeUser';
import InvoiceCreate from './pages/invoices/InvoiceCreatePage';
import UsersCRUD from './pages/admin/UsersCRUD';
import RolesCRUD from './pages/admin/RolesCRUD';
import ProductsCRUD from './pages/product/ProductsCRUD';
import ClientsCRUD from './pages/client/ClientsCRUD';
import Invoices from './pages/invoices/Invoices';
import ProtectedRoute from '../src/components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
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

const getUserRole = (): string => {
  const userData = localStorage.getItem('userData');

  if (!userData) return '';

  try {
    const parsedData = JSON.parse(userData);
    return parsedData.roles && parsedData.roles.length > 0 ? parsedData.roles[0] : '';
  } catch (error) {
    return '';
  }
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isInitialized, loading } = useAuth();
  const userRole = getUserRole();

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
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to={userRole === "Administrator" ? "/admin" : "/user"} replace /> : 
            <LoginPage />
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? (userRole === "Administrator" ? "/admin" : "/user") : "/login"} replace />
          } 
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]} userRole={userRole}>
              <HomeAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]} userRole={userRole}>
              <UsersCRUD />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]} userRole={userRole}>
              <RolesCRUD />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]} userRole={userRole}>
              <ProductsCRUD />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]} userRole={userRole}>
              <ClientsCRUD />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invoices"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]} userRole={userRole}>
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["User"]} userRole={userRole}>
              <HomeUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["User"]} userRole={userRole}>
              <HomeUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/create"
          element={
            <ProtectedRoute allowedRoles={["Administrator", "user"]} userRole={userRole}>
              <InvoiceCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/factura/nueva"
          element={
            <ProtectedRoute allowedRoles={["Administrator", "user"]} userRole={userRole}>
              <InvoiceCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute allowedRoles={["Administrator", "user"]} userRole={userRole}>
              <Invoices />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
