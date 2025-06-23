import React from 'react';
import  '../../assets/styles/AuthLayout.css';
import backgroundImage from '../../assets/images/background.jpg';
interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children
}) => {
  // Usa la imagen importada por defecto si no se proporciona una
  const imageToUse = backgroundImage;
  return (
    <div 
      className="authLayout"
      style={{ backgroundImage: `url(${imageToUse})` }}
    >
      <div className="content">
        {children}
      </div>
    </div>
  );
};