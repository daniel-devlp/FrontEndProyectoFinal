import React from 'react';
import '../../assets/styles/DynamicButton.css';

interface DynamicButtonProps {
  type: 'edit' | 'delete' | 'save';
  onClick: () => void;
  label?: string;
}

const DynamicButton: React.FC<DynamicButtonProps> = ({ type, onClick, label }) => {
  const getButtonClass = () => {
    switch (type) {
      case 'edit':
        return 'dynamic-btn edit-btn';
      case 'delete':
        return 'dynamic-btn delete-btn';
      case 'save':
        return 'dynamic-btn save-btn';
      default:
        return 'dynamic-btn';
    }
  };

  return (
    <button className={getButtonClass()} onClick={onClick}>
      {label || type.charAt(0).toUpperCase() + type.slice(1)}
    </button>
  );
};

export default DynamicButton;
