import React, { useState } from 'react';
import './../../assets/styles/SmartSearch.css';

interface SmartSearchProps<T> {
  data: T[];
  searchKeys: (keyof T)[];
  placeholder?: string;
  onSelect: (item: T) => void;
}

function SmartSearch<T extends Record<string, any>>({
  data,
  searchKeys,
  placeholder = 'Buscar...',
  onSelect,
}: SmartSearchProps<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 0) {
      const filtered = data.filter(item =>
        searchKeys.some(key =>
          String(item[key]).toLowerCase().includes(value.toLowerCase())
        )
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="smart-search">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((item, idx) => (
            <li
              key={idx}
              className="search-item"
              onClick={() => {
                onSelect(item);
                setQuery('');
                setResults([]);
              }}
            >
              {searchKeys.map(key => item[key]).join(' - ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SmartSearch;
