import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginFrom';
import RoleSelectionModal from '../../components/auth/RoleSelectionModal';
import '../../assets/styles/LoginPages.css';

export default function LoginPage() {
  const { 
    login, 
    errorCode, 
    technicalMessage, 
    loading, 
    requiresRoleSelection, 
    availableRoles,
    selectRole 
  } = useAuth();
  const [attempts, setAttempts] = useState(0);

  const handleLogin = async (email: string, password: string) => {
    if (attempts >= 3) {
      toast.error('Demasiados intentos fallidos. Por favor espera un momento.');
      setAttempts(0);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result && !result.requiresRoleSelection) {
        // Usuario tiene un solo rol, redirigir directamente
        toast.success('¡Bienvenido! Redirigiendo...');
        setTimeout(() => {
          const redirectPath = result.selectedRole === 'Administrator' ? '/admin' : '/user/dashboard';
          window.location.href = redirectPath;
        }, 1500);
      }
      // Si requiresRoleSelection es true, el modal se mostrará automáticamente
    } catch (error) {
      setAttempts((prev) => prev + 1);
      
      // Manejo de errores específicos con toast
      if (errorCode) {
        switch (errorCode) {
          case 'INVALID_CREDENTIALS':
            toast.error('El usuario no existe');
            break;
          case 'USER_BLOCKED':
            toast.error('Usuario bloqueado. Contacta al administrador');
            break;
          case 'NETWORK_ERROR':
            toast.error('Error de conexión. Verifica tu internet');
            break;
          default:
            toast.error(technicalMessage || 'Error al iniciar sesión');
        }
      } else {
        toast.error('Error al iniciar sesión. Verifica tus credenciales');
      }
    }
  };

  const handleRoleSelection = (role: string) => {
    selectRole(role);
    toast.success(`¡Bienvenido como ${role === 'Administrator' ? 'Administrador' : 'Usuario'}! Redirigiendo...`);
    
    setTimeout(() => {
      const redirectPath = role === 'Administrator' ? '/admin/dashboard' : '/user/dashboard';
      window.location.href = redirectPath;
    }, 1500);
  };

  return (
    <>
      <LoginForm onLogin={handleLogin} loading={loading} />
      
      <RoleSelectionModal
        isOpen={requiresRoleSelection}
        roles={availableRoles}
        onRoleSelect={handleRoleSelection}
        onClose={() => {}} // No permitir cerrar sin seleccionar
      />
    </>
  );
}