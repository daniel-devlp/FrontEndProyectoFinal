import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginFrom';
import '../../assets/styles/LoginPages.css';

export default function LoginPage() {
  const { login, errorCode, technicalMessage, loading } = useAuth();
  const [attempts, setAttempts] = useState(0);

  const handleLogin = async (email: string, password: string) => {
    if (attempts >= 3) {
      toast.error('Demasiados intentos fallidos. Por favor espera un momento.');
      setAttempts(0);
      return;
    }

    try {
      const role = await login(email, password);
      toast.success('¡Bienvenido! Redirigiendo...');
      
      setTimeout(() => {
        const redirectPath = role === 'Administrator' ? '/admin/dashboard' : '/user/dashboard';
        window.location.href = redirectPath;
      }, 1500);
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
  return (
    <LoginForm onLogin={handleLogin} loading={loading} />
  );
}