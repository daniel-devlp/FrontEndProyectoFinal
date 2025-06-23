import React from 'react';
import './../../assets/styles/Button.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = 'button', className, variant = 'primary' }) => {
  const buttonClassName = `button ${variant} ${className}`;
  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClassName}
    >
      {children}
    </button>
  );
};

export default Button;
