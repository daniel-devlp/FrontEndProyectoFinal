import React from 'react';
import '../../assets/styles/SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Buscar...', value, onChange }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
