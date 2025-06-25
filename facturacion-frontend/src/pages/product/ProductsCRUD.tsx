import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { useProducts } from '../../hooks/useProducts';
import type { ProductDto } from '../../@types/products';
import '../../assets/styles/ProductsCRUD.css';
import Modal from '../../components/common/Modal';
import DynamicButton from '../../components/common/DynamicButton';
import { notifications, confirmAction, confirmDestructiveAction, confirmUpdateAction, withLoadingToast } from '../../utils/notifications';
import SearchBar from '../../components/common/SearchBar';

const ProductsCRUD: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
  });
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto>({
    productId: 0,
    code: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const { products, totalItems, loading, searching, error, createProduct, updateProduct, deleteProduct } = useProducts({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    searchTerm,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search term changes
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedProduct({
      productId: 0,
      code: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
    });
  };

  const validateProductForm = (product: typeof newProduct) => {
    const newErrors: Record<string, string> = {};

    if (!product.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    }
    if (!product.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (product.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }
    if (product.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    return newErrors;
  };  const handleEdit = async () => {
    // Confirmación antes de actualizar
    const confirmed = await confirmUpdateAction(
      '¿Estás seguro de que deseas actualizar este producto?',
      'Confirmar Actualización de Producto'
    );
    if (!confirmed) return;

    const validationErrors = validateProductForm(selectedProduct);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      notifications.error('Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      await withLoadingToast(
        () => updateProduct(selectedProduct.productId, selectedProduct),
        'Actualizando producto...',
        'Producto actualizado exitosamente'
      );
      handleEditModalClose();
      setErrors({});
    } catch (error) {
      // El toast ya se muestra en el hook useProducts, no necesitamos duplicarlo aquí
      console.error('Error al actualizar producto:', error);
    }  };  const handleDelete = async (productId: number) => {
    const product = products.find(p => p.productId === productId);
    const productName = product ? product.name : 'este producto';
    
    const confirmed = await confirmDestructiveAction(
      `¿Estás seguro de que deseas eliminar ${productName}? Esta acción no se puede deshacer.`,
      'Confirmar Eliminación de Producto',
      'Sí, eliminar producto'
    );
    
    if (confirmed) {
      try {
        await withLoadingToast(
          () => deleteProduct(productId),
          'Eliminando producto...',
          'Producto eliminado exitosamente'
        );
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        notifications.error('Error al eliminar producto');
      }
    }
  };  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Confirmación antes de crear
    const confirmed = await confirmAction(
      '¿Estás seguro de que deseas crear este producto?',
      'Confirmar Creación de Producto'
    );
    if (!confirmed) return;

    const validationErrors = validateProductForm(newProduct);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      notifications.error('Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      await withLoadingToast(
        () => createProduct(newProduct),
        'Creando producto...',
        'Producto creado exitosamente'
      );
      setModalOpen(false);
      setNewProduct({
        code: '',
        name: '',
        description: '',
        price: 0,
        stock: 0,
      });
      setErrors({});
    } catch (error) {
      // El toast ya se muestra en el hook useProducts, no necesitamos duplicarlo aquí
      console.error('Error al crear producto:', error);
    }
  };
  // Solo mostrar loading completo durante la carga inicial
  if (loading && products.length === 0) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Error al cargar productos: {error}</p>
        <p>Por favor, verifica la estructura de la respuesta del servidor.</p>
      </div>
    );
  }

  return (
    <div className="products-crud">
      <Navbar />
      <div className="crud-dashboard">
        <h1>Gestión de Productos</h1>        <p>Total de productos: {totalItems}</p>        <div className="search-bar">
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
        </div>        <div className="table-container">
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productId}>
                    <td className="text-right">{product.productId}</td>
                    <td className="text-left">{product.code}</td>
                    <td className="text-left">{product.name}</td>
                    <td className="text-left">{product.description}</td>
                    <td className="text-right number-format">${product.price.toFixed(2)}</td>
                    <td className="text-right">{product.stock}</td>
                    <td className="text-left">
                      <div className="actions-cell">
                        <DynamicButton
                          type="edit"
                          onClick={() => {
                            setSelectedProduct(product);
                            setEditModalOpen(true);
                          }}
                          label="Editar"
                        />
                        <DynamicButton
                          type="delete"
                          onClick={() => handleDelete(product.productId)}
                          label="Eliminar"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        </div>
        <div className="crud-actions">
          <DynamicButton
            type="save"
            onClick={() => setModalOpen(true)}
            label="Agregar Producto"
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title="Agregar Producto"
          onSubmit={handleCreate}
        >
          <form>
            <div className="form-field">
              <label>Código:</label>
              <input
                id="code"
                type="text"
                value={newProduct.code}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, code: e.target.value }))}
                className={errors.code ? 'error' : ''}
              />
              {errors.code && <span className="error-message">{errors.code}</span>}
            </div>
            <div className="form-field">
              <label>Nombre:</label>
              <input
                id="name"
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="form-field">
              <label>Descripción:</label>
              <input
                id="description"
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label>Precio:</label>
              <input
                id="price"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>
            <div className="form-field">
              <label>Stock:</label>
              <input
                id="stock"
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: parseInt(e.target.value, 10) }))}
                className={errors.stock ? 'error' : ''}
              />
              {errors.stock && <span className="error-message">{errors.stock}</span>}
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          title="Editar Producto"
          onSubmit={handleEdit}
        >
          <form>
            <div className="form-field">
              <label>Código:</label>
              <input
                id="code"
                type="text"
                value={selectedProduct.code}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({ ...prev, code: e.target.value }))
                }
                className={errors.code ? 'error' : ''}
              />
              {errors.code && <span className="error-message">{errors.code}</span>}
            </div>
            <div className="form-field">
              <label>Nombre:</label>
              <input
                id="name"
                type="text"
                value={selectedProduct.name}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({ ...prev, name: e.target.value }))
                }
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="form-field">
              <label>Descripción:</label>
              <input
                id="description"
                type="text"
                value={selectedProduct.description}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="form-field">
              <label>Precio:</label>
              <input
                id="price"
                type="number"
                value={selectedProduct.price}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({ ...prev, price: parseFloat(e.target.value) }))
                }
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>
            <div className="form-field">
              <label>Stock:</label>
              <input
                id="stock"
                type="number"
                value={selectedProduct.stock}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({ ...prev, stock: parseInt(e.target.value, 10) }))
                }
                className={errors.stock ? 'error' : ''}
              />
              {errors.stock && <span className="error-message">{errors.stock}</span>}
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ProductsCRUD;



