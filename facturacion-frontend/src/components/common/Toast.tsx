import React, { useEffect, useState } from 'react';
import '../../assets/styles/Toast.css';

interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 4000 
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type} ${show ? 'toast-show' : 'toast-hide'}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {type === 'error' && '⚠️'}
          {type === 'success' && '✅'}
          {type === 'info' && 'ℹ️'}
          {type === 'warning' && '⚠️'}
        </div>
        <div className="toast-message">
          {message}
        </div>
        <button 
          className="toast-close" 
          onClick={handleClose}
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
