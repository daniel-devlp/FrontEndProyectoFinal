import React from 'react';
import '../../assets/styles/SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = 'Buscar...', 
  value, 
  onChange,
  onClear,
  disabled = false,
  className = '',
  autoFocus = false
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Limpiar el campo con Escape
    if (e.key === 'Escape' && onClear) {
      onClear();
    }
  };

  return (
    <div className={`search-bar ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};

export default SearchBar;
