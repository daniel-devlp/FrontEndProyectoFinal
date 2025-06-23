import React from 'react';
import './../../assets/styles/Table.css';

interface TableProps<T> {
  columns: { key: string; header: string }[];
  data: T[];
  renderActions?: (item: T) => React.ReactNode;
}

function Table<T extends Record<string, any>>({ columns, data, renderActions }: TableProps<T>) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
            {renderActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col.key}>{typeof item[col.key] === 'object' ? JSON.stringify(item[col.key]) : item[col.key]}</td>
              ))}
              {renderActions && <td>{renderActions(item)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
