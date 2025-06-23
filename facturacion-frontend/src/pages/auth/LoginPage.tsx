import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginFrom';
import LoginErrorHandler from '../../components/auth/LoginErrorHandler';
import '../../assets/styles/LoginPages.css';

export default function LoginPage() {
  const { login, errorCode, technicalMessage, loading } = useAuth();
  const [attempts, setAttempts] = useState(0);

  const handleLogin = async (email: string, password: string) => {
    if (attempts >= 3) {
      setAttempts(0); // Reinicia intentos después de bloquear
      return;
    }

    try {
      const role = await login(email, password);
      const redirectPath = role === 'Administrator' ? '/admin/dashboard' : '/user/dashboard';
      window.location.href = redirectPath;
    } catch {
      setAttempts((prev) => prev + 1);
    }
  };

  return (
    <AuthLayout backgroundImage="/images/auth-bg.jpg">
      <LoginErrorHandler
        errorCode={errorCode}
        technicalMessage={technicalMessage}
        onClose={() => {}}
      />
      <div className="loginContainer">
        <h1 className="appTitle">RAN_SHELL</h1>
        <LoginForm onLogin={handleLogin} loading={loading} error={undefined} />
        <div className="divider">
          <span>o</span>
        </div>
        <div className="footerLinks">
          <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
        
        </div>
      </div>
    </AuthLayout>
  );
}