import React from 'react';
import './../../assets/styles/Input.css';

interface InputProps {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div className="input-container">
    {label && <label className="input-label">{label}</label>}
    <input className="input-field" {...props} />
  </div>
);

export default Input;
