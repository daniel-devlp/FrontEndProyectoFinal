import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import { useProducts } from '../../hooks/useProducts';
import '../../assets/styles/UserProductsView.css';

const UserProductsView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const { products, totalItems, loading, searching, error } = useProducts({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    searchTerm,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return (
    <div className="user-products-view">
      <Navbar />
      <div className="user-products-dashboard">
        <h1>Catálogo de Productos</h1>
        <p style={{ 
          color: '#7f8c8d', 
          marginBottom: '2rem',
          fontSize: '1.1rem',
          fontStyle: 'italic'
        }}>
          Vista de solo lectura - Consulta los productos disponibles
        </p>
      
      <div className="search-bar">
        <SearchBar
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searching && (
          <div style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginTop: '5px',
            fontStyle: 'italic'
          }}>
            Buscando...
          </div>
        )}
      </div>

      {loading && products.length === 0 && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}      <Table
        columns={[
          { key: 'name', header: 'Nombre' },
          { key: 'price', header: 'Precio' },
          { key: 'stock', header: 'Stock' },
          { key: 'status', header: 'Estado' }
        ]}
        data={products.map(product => ({
          productId: product.productId,
          name: product.name,
          price: `$${product.price.toFixed(2)}`,
          stock: product.stock.toString(),
          status: product.stock > 0 ? '✅ Disponible' : '❌ Agotado'
        }))}
        renderActions={() => (
          <span style={{ 
            color: '#7f8c8d', 
            fontStyle: 'italic',
            fontSize: '0.9rem'
          }}>
            Solo lectura
          </span>
        )}
      />

      <div className="pagination-controls">
        <button
          disabled={currentPage === 1 || loading}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          disabled={currentPage === totalPages || loading}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Siguiente
        </button>
      </div>

      <div className="info-card" style={{
        backgroundColor: '#e8f4f8',
        border: '1px solid #bee5eb',
        borderRadius: '8px',
        padding: '1.5rem',
        marginTop: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '2rem' }}>ℹ️</div>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0c5460' }}>
            Información para Usuarios
          </h4>
          <p style={{ margin: 0, color: '#0c5460' }}>
            Como usuario, puedes consultar el catálogo de productos para crear facturas, 
            pero no tienes permisos para crear, editar o eliminar productos.          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default UserProductsView;
