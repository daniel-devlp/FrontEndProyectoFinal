import React from 'react';
import './../../assets/styles/Alert.css';

interface AlertProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

const Alert: React.FC<AlertProps> = ({ message, type = 'info' }) => (
  <div className={`alert ${type}`}>{message}</div>
);

export default Alert;
