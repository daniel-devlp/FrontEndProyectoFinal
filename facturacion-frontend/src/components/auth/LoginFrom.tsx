import React, { useState } from 'react';
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
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="loginForm">
      <h2 className="title">Iniciar Sesión</h2>
      
      {error && <div className="error">{error}</div>}

      <div className="formGroup">
        <label htmlFor="email" className="label">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
          disabled={loading}
        />
      </div>

      <div className="formGroup">
        <label htmlFor="password" className="label">Contraseña</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
          disabled={loading}
        />
      </div>

      <button 
        type="submit" 
        className="submitButton"
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Ingresar'}
      </button>
    </form>
  );
};