import React from 'react';
import  '../../assets/styles/AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children,
  backgroundImage
}) => {
  return (
    <div 
      className="authLayout"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      <div className="content">
        {children}
      </div>
    </div>
  );
};