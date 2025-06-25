import React, { useState } from 'react';
import { notifications } from '../../utils/notifications';
import '../../assets/styles/LoginForm.css';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  loading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  loading = false, 
  error 
}) => {  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    // Toast simple que debe funcionar correctamente
    notifications.info('Para recuperar tu contraseña, por favor comunícate con el administrador del sistema.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();    if (!email) {
      notifications.error('Por favor ingresa tu email');
      return;
    }
    
    if (!password) {
      notifications.error('Por favor ingresa tu contraseña');
      return;
    }
    
    onLogin(email, password);
  };

  React.useEffect(() => {
    if (error) {
      notifications.error(error);
    }
  }, [error]);  return (
    <div className="loginContainer">
      <div className="loginFormCard">
        {/* Header decorativo exacto a la primera imagen */}
        <div className="loginHeader">
          {/* Círculo decorativo (sol) */}
          <div className="decorative-circle"></div>
          {/* Montaña central */}
          <div className="mountain-center"></div>
        </div>
        
        <div className="loginContent">
          <form onSubmit={handleSubmit} className="loginForm">
            <h2 className="title">Login</h2>
            
            <div className="formGroup">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Username"
                required
                disabled={loading}
              />
            </div>

            <div className="formGroup">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Password"
                required
                disabled={loading}
              />
            </div>

            <div className="loginOptions">
              <label className="rememberMe">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                remember me
              </label>              <a 
                href="#" 
                className="forgotPassword"
                onClick={handleForgotPassword}
              >
                forgot password
              </a>
            </div>

            <button 
              type="submit" 
              className="submitButton"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>

           
          </form>
        </div>
      </div>
    </div>
  );
};


