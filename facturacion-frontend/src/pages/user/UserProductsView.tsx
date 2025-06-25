/**
 * Componente UserProductsView
 * 
 * Una vista integral de catálogo de productos de solo lectura diseñada específicamente para usuarios finales.
 * Este componente proporciona una interfaz paginada y buscable para navegar productos disponibles
 * sin capacidades administrativas.
 * 
 * Características Principales:
 * - Listado paginado de productos con elementos configurables por página
 * - Funcionalidad de búsqueda en tiempo real con consultas debounced
 * - Diseño de cuadrícula responsivo para visualización óptima en todos los dispositivos
 * - Estados de carga y manejo de errores
 * - Navegación profesional con barra de navegación integrada
 * 
 * Experiencia del Usuario:
 * - Visualización de productos estilo catálogo limpio
 * - Funcionalidad de búsqueda mientras escribes
 * - Controles de paginación intuitivos
 * - Diseño responsivo para móvil y escritorio
 * - Navegación accesible por teclado
 * 
 * Implementación Técnica:
 * - Usa el hook personalizado useProducts para gestión de datos
 * - Implementa componentes controlados para búsqueda y paginación
 * - Re-renderizado optimizado a través de gestión adecuada del estado
 * - Compatible con límites de error
 * 
 * Contexto de Uso:
 * Destinado para usuarios regulares (no administradores) para navegar el catálogo de productos.
 * Este componente debe usarse dentro de una ruta protegida que asegure la autenticación del usuario.
 * 
 * @componente
 * @ejemplo
 * ```tsx
 * // Dentro de una ruta protegida para usuarios autenticados
 * <UserProductsView />
 * ```
 * 
 * Estilizado:
 * - Usa UserProductsView.css para estilos específicos del componente
 * - Hereda estilos globales para tematización consistente
 * - Breakpoints responsivos para optimización móvil
 * 
 * Mejoras Futuras:
 * - Filtrado de productos por categoría/rango de precios
 * - Integración de modal/página de detalle de producto
 * - Funcionalidad de lista de deseos
 * - Características de comparación de productos
 * - Opciones de ordenamiento avanzadas (precio, nombre, fecha)
 * - Acciones masivas para selección de productos
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 */
import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import SearchBar from '../../components/common/SearchBar';
import { useProducts } from '../../hooks/useProducts';
import '../../assets/styles/UserProductsView.css';

/**
 * Componente funcional UserProductsView
 * 
 * Renderiza una interfaz completa de navegación de productos con capacidades de búsqueda y paginación.
 * Diseñado para descubrimiento y navegación de productos por usuarios finales.
 * 
 * Gestión del Estado:
 * - currentPage: Rastrea la página de paginación activa
 * - searchTerm: Almacena la consulta de búsqueda actual
 * - itemsPerPage: Tamaño de página configurable (actualmente fijo en 10)
 * 
 * @retorna {JSX.Element} Interfaz completa de navegación de productos del usuario
 */
const UserProductsView: React.FC = () => {
  // Gestión del estado de paginación
  // Controla qué página de resultados se muestra actualmente
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estado de funcionalidad de búsqueda
  // Almacena el término de búsqueda actual para filtrar productos
  const [searchTerm, setSearchTerm] = useState('');
  
  // Configuration for pagination
  // Determines how many products are shown per page
  const itemsPerPage = 10;

  // Custom hook for product data management
  // Handles fetching, searching, pagination, and loading states
  const { products, totalItems, loading, searching, error } = useProducts({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    searchTerm,
  });

  /**
   * Handles search input changes
   * 
   * Updates the search term and resets pagination to first page
   * to ensure search results start from the beginning.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  /**
   * Handles pagination navigation
   * 
   * Updates the current page state to navigate through product results.
   * The useProducts hook will automatically fetch new data based on the page change.
   * 
   * @param {number} newPage - The target page number to navigate to
   */
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Calculate total pages for pagination controls
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return (
    <div className="user-products-view">
      {/* Componente de Navegación */}
      {/* Renders the main navigation bar for consistent site navigation */}
      <Navbar />
      
      <div className="user-products-dashboard">
        {/* Page Header and Description */}
        {/* 
          Clear page title and descriptive text to help users understand
          the read-only nature of this product catalog view
        */}
        <h1>Catálogo de Productos</h1>
        <p style={{ 
          color: '#7f8c8d', 
          marginBottom: '2rem',
          fontSize: '1.1rem',
          fontStyle: 'italic'
        }}>
          Vista de solo lectura - Consulta los productos disponibles
        </p>
      
        {/* Search Functionality Section */}
        {/* 
          Provides real-time search capabilities for product filtering.
          Includes visual feedback during search operations.
        */}
        <div className="search-bar">
          <SearchBar
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {/* Search Status Indicator */}
          {/* Shows visual feedback when search is in progress */}
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

        {/* Loading and Error States */}
        {/* 
          Provides user feedback during data loading and error conditions.
          Only shows loading message when no products are currently displayed.
        */}
        {loading && products.length === 0 && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}
        
        {/* Product Data Table */}
        {/* 
          Displays products in a structured table format with:
          - Product identification (ID and code)
          - Product details (name, description, price)
          - Inventory information (stock, availability status)
          - Visual status indicators for stock availability
        */}
        <div className="table-container">
          <div className="user-products-table-container">
            <table className="user-products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {/* Dynamic Product Rows */}
                {/* 
                  Renders each product with proper formatting:
                  - Right-aligned numbers for better readability
                  - Left-aligned text for natural reading flow
                  - Currency formatting for prices
                  - Visual availability indicators
                */}
                {products.map((product) => (
                  <tr key={product.productId}>
                    <td className="text-right">{product.productId}</td>
                    <td className="text-left">{product.code}</td>
                    <td className="text-left">{product.name}</td>
                    <td className="text-left">{product.description}</td>
                    <td className="text-right number-format">${product.price.toFixed(2)}</td>
                    <td className="text-right">{product.stock}</td>
                    <td className="text-left">
                      {/* Stock Availability Indicator */}
                      {/* Visual status with emoji and text for clear communication */}
                      {product.stock > 0 ? 
                        <span className="status-available">✅ Disponible</span> : 
                        <span className="status-unavailable">❌ Agotado</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {/* 
          Provides navigation through paginated results with:
          - Previous/Next buttons with proper disabled states
          - Current page indicator and total pages
          - Button states that reflect loading conditions
        */}
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

        {/* User Information Card */}
        {/* 
          Componente educativo que explica los permisos y capacidades del usuario.
          Helps users understand their role limitations in a friendly way.
        */}
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
              pero no tienes permisos para crear, editar o eliminar productos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProductsView;
