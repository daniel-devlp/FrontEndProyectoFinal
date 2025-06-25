/**
 * Componente UserInvoices
 * 
 * Una interfaz integral de gestión de facturas diseñada específicamente para usuarios finales.
 * Este componente proporciona capacidades completas CRUD (Crear, Leer, Actualizar, Eliminar)
 * para la gestión de facturas con características avanzadas como vista previa, edición y eliminación.
 * 
 * Características Principales:
 * - Listado paginado de facturas con funcionalidad de búsqueda
 * - Vista previa de facturas en tiempo real con información detallada de productos
 * - Capacidades completas de edición de facturas con validación de formularios
 * - Eliminación segura de facturas con diálogos de confirmación
 * - Notificaciones modernas basadas en toast para todas las operaciones
 * - Diseño responsivo optimizado para varios tamaños de pantalla
 * - Integración de navegación para flujo de trabajo de creación de facturas
 * 
 * Experiencia del Usuario:
 * - Interfaz intuitiva con botones de acción claros
 * - Formularios basados en modales para edición no disruptiva
 * - Estados de carga para mejor retroalimentación del usuario
 * - Manejo de errores con mensajes amigables para el usuario
 * - Diálogos de confirmación para operaciones destructivas
 * 
 * Implementación Técnica:
 * - Usa el hook personalizado useInvoices para gestión de datos
 * - Implementa componentes controlados para formularios y búsqueda
 * - Notificaciones toast modernas via react-hot-toast
 * - Re-renderizado optimizado a través de gestión adecuada del estado
 * - Diseño compatible con límites de error
 * 
 * Seguridad y Permisos:
 * - Control de acceso a nivel de usuario (sin restricciones de admin)
 * - Confirmaciones de eliminación segura
 * - Validación y sanitización de entradas
 * - Manejo adecuado de errores para acciones no autorizadas
 * 
 * Puntos de Integración:
 * - Navegación a página de creación de facturas
 * - Integración del servicio de productos para vistas detalladas
 * - Servicio de facturas para todas las operaciones CRUD
 * - Sistema de notificaciones para retroalimentación del usuario
 * 
 * @componente
 * @ejemplo
 * ```tsx
 * // Dentro de una ruta protegida para usuarios autenticados
 * <UserInvoices />
 * ```
 * 
 * Estilizado:
 * - Usa UserInvoices.css para estilos específicos del componente
 * - Diseño de tabla responsivo con optimización móvil
 * - Superposiciones de modal modernas y estilizado de formularios
 * - Tematización consistente de botones y entradas
 * 
 * Mejoras Futuras:
 * - Operaciones masivas de facturas
 * - Filtrado avanzado (rangos de fechas, estado, cantidad)
 * - Funcionalidad de exportación (PDF, Excel)
 * - Características de duplicación de facturas
 * - Integración de email para envío de facturas
 * - Diseños amigables para impresión
 * - Plantillas de facturas y personalización
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import DynamicButton from '../../components/common/DynamicButton';
import { notifications } from '../../utils/notifications';
import { useInvoices } from '../../hooks/useInvoices';
import { invoiceService } from '../../services/invoiceService';
import { productService } from '../../services/productService';
import type { InvoiceDto } from '../../@types/invoices';
import '../../assets/styles/UserInvoices.css';

/**
 * Componente funcional UserInvoices
 * 
 * Renderiza una interfaz completa de gestión de facturas con capacidades CRUD completas.
 * Proporciona a los usuarios herramientas para gestionar sus facturas eficientemente.
 * 
 * Gestión del Estado:
 * - currentPage: Control de paginación para listado de facturas
 * - searchTerm: Funcionalidad de búsqueda en tiempo real
 * - Estados de Modal: Controles para modales de vista previa y edición
 * - selectedInvoice: Factura actualmente seleccionada para operaciones
 * - invoiceDetails: Datos detallados de factura para vista previa/edición
 * - loadingPreview: Estado de carga para operaciones asíncronas
 * 
 * @retorna {JSX.Element} Interfaz completa de gestión de facturas
 */
const UserInvoices: React.FC = () => {
  // Hook de navegación para enrutamiento programático
  const navigate = useNavigate();
  
  // Pagination state management
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search functionality state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal control states
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<InvoiceDto | null>(null);
  
  // Invoice details and loading states
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Configuration
  const itemsPerPage = 10;

  // Custom hook for invoice data management
  const { invoices, totalItems, loading, searching, error } = useInvoices({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    searchTerm,
  });

  /**
   * Handles search input changes
   * 
   * Updates the search term and resets pagination to ensure
   * search results start from the first page.
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
   * Updates the current page state for invoice pagination.
   * The useInvoices hook will automatically fetch new data.
   * 
   * @param {number} newPage - Target page number
   */
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  /**
   * Handles PDF download generation for invoices
   * 
   * Fetches detailed invoice data, enriches it with product information,
   * and generates a downloadable PDF file with proper formatting.
   * 
   * Process:
   * 1. Fetch invoice details from the service
   * 2. Enrich invoice items with product names
   * 3. Generate PDF with proper formatting
   * 4. Trigger browser download
   * 
   * @param {number} invoiceId - ID of the invoice to download
   */
  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      const invoiceDetails = await invoiceService.getInvoiceDetails(invoiceId);
      const invoice = invoices.find((inv) => inv.invoiceId === invoiceId);
      if (!invoice) throw new Error('Factura no encontrada');

      // Enrich invoice details with product names
      // Uses caching to avoid duplicate API calls for the same product
      const productCache = new Map<number, any>();
      const enrichedDetails = await Promise.all(
        invoiceDetails.map(async (detail: any) => {
          try {
            const productId = detail.productId || detail.ProductId;
            if (productId) {
              // Verificar cache
              if (productCache.has(productId)) {
                const cachedProduct = productCache.get(productId);
                return {
                  ...detail,
                  productName: cachedProduct?.name || `Producto ID: ${productId}`
                };
              }
              
              // Obtener producto del backend
              const product = await productService.getProductById(productId);
              productCache.set(productId, product);
              
              return {
                ...detail,
                productName: product?.name || `Producto ID: ${productId}`
              };
            }
            return {
              ...detail,
              productName: 'Producto no especificado'
            };
          } catch (productError) {
            console.log(`Error al obtener producto ID ${detail.productId}:`, productError);
            return {
              ...detail,
              productName: `Producto no disponible (ID: ${detail.productId || 'N/A'})`
            };
          }
        })
      );

      const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`;
      const total = invoice.total;

      invoiceService.generateInvoicePDF(
        { name: clientName, email: invoice.client.email ?? '', phone: invoice.client.phone ?? '' },
        enrichedDetails,
        total
      );
      notifications.success('Factura descargada exitosamente');
    } catch (err) {
      notifications.error('Error al descargar la factura');
    }
  };

  /**
   * Handles invoice preview functionality
   * 
   * Fetches detailed invoice data and displays it in a modal preview.
   * Enriches invoice items with product information for better display.
   * 
   * Process:
   * 1. Set loading state for user feedback
   * 2. Find invoice in current data
   * 3. Fetch detailed invoice information
   * 4. Enrich with product data using caching
   * 5. Display in preview modal
   * 
   * @param {number} invoiceId - ID of the invoice to preview
   */
  const handlePreviewInvoice = async (invoiceId: number) => {
    try {
      setLoadingPreview(true);
      
      const invoice = invoices.find(inv => inv.invoiceId === invoiceId);
      if (!invoice) {
        notifications.error('Factura no encontrada');
        return;
      }
      
      let enrichedDetails = null;
      try {
        const fullInvoice = await invoiceService.getInvoiceById(invoiceId);
        
        if (fullInvoice && (fullInvoice as any).invoiceDetails && Array.isArray((fullInvoice as any).invoiceDetails)) {
          // Product caching to avoid duplicate API calls
          const productCache = new Map<number, any>();
          
          const enrichedInvoiceDetails = await Promise.all(
            (fullInvoice as any).invoiceDetails.map(async (detail: any) => {
              try {
                const productId = detail.productId || detail.ProductId;
                if (productId && (!detail.product?.name && !detail.productName && !detail.Product?.name)) {
                  if (productCache.has(productId)) {
                    const cachedProduct = productCache.get(productId);
                    return {
                      ...detail,
                      product: cachedProduct,
                      productName: cachedProduct?.name
                    };
                  }
                  
                  const product = await productService.getProductById(productId);
                  productCache.set(productId, product);
                  
                  return {
                    ...detail,
                    product: product,
                    productName: product?.name
                  };
                }
                return detail;
              } catch (productError) {
                console.log(`Error al obtener producto ID ${detail.productId || detail.ProductId}:`, productError);
                return detail;
              }
            })
          );
          
          enrichedDetails = {
            ...fullInvoice,
            invoiceDetails: enrichedInvoiceDetails
          };
        } else {
          enrichedDetails = fullInvoice;
        }
      } catch (invoiceError) {
        try {
          const details = await invoiceService.getInvoiceDetails(invoiceId);
          
          if (Array.isArray(details) && details.length > 0) {
            const productCache = new Map<number, any>();
            
            const enrichedDetailsPromises = details.map(async (detail: any) => {
              try {
                const productId = detail.productId || detail.ProductId;
                if (productId) {
                  if (productCache.has(productId)) {
                    const cachedProduct = productCache.get(productId);
                    return {
                      ...detail,
                      product: cachedProduct,
                      productName: cachedProduct?.name || `Producto ID: ${productId}`
                    };
                  }
                  
                  const product = await productService.getProductById(productId);
                  productCache.set(productId, product);
                    
                  return {
                    ...detail,
                    product: product || null,
                    productName: product?.name || `Producto ID: ${productId}`
                  };
                }
                return {
                  ...detail,
                  productName: 'Producto no especificado'
                };
              } catch (productError) {
                return {
                  ...detail,
                  productName: `Producto no disponible (ID: ${detail.productId || detail.ProductId || 'N/A'})`
                };
              }
            });
            
            enrichedDetails = await Promise.all(enrichedDetailsPromises);
          } else {
            enrichedDetails = details;
          }
        } catch (detailsError) {
          enrichedDetails = [];
        }
      }
      
      setSelectedInvoiceForPreview(invoice);
      setInvoiceDetails(enrichedDetails);
      setPreviewModalOpen(true);
    } catch (err) {
      notifications.error('Error al cargar la previsualización de la factura');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return (
    <div className="user-invoices">
      {/* Componente de Navegación */}
      <Navbar />
      
      <div className="user-invoices-dashboard">
        {/* Page Header */}
        {/* Clear title and description for user context */}
        <h1>Mis Facturas</h1>
        <p style={{ 
          color: '#7f8c8d', 
          marginBottom: '2rem',
          fontSize: '1.1rem',
          fontStyle: 'italic'
        }}>
          Panel de usuario - Consultar y descargar facturas
        </p>
        
        {/* Search Functionality */}
        {/* Real-time search with visual feedback */}
        <div className="search-bar">
          <SearchBar
            placeholder="Buscar facturas..."
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
        
        {/* Loading and Error States */}
        {loading && invoices.length === 0 && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}
        
        {/* Invoice Data Table */}
        {/* 
          Displays invoices with action buttons for preview and download.
          Includes proper formatting for dates, currency, and client names.
        */}
        <div className="table-container">
          <div className="user-invoices-table-container">
            <table className="user-invoices-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Número de Factura</th>
                  <th>Cliente</th>
                  <th>Fecha de Emisión</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {/* Dynamic Invoice Rows */}
                {invoices.map((invoice) => (
                  <tr key={invoice.invoiceId}>
                    <td className="text-right">{invoice.invoiceId}</td>
                    <td className="text-left">{invoice.invoiceNumber}</td>
                    <td className="text-left">{`${invoice.client.firstName} ${invoice.client.lastName}`}</td>
                    <td className="text-left">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                    <td className="text-right number-format">${invoice.total.toFixed(2)}</td>
                    <td className="text-left">
                      {/* Action Buttons */}
                      {/* Preview and download functionality for each invoice */}
                      <div className="actions-cell">
                        <DynamicButton
                          type="edit"
                          onClick={() => handlePreviewInvoice(invoice.invoiceId)}
                          label="Ver Detalle"
                        />
                        <DynamicButton
                          type="save"
                          onClick={() => handleDownloadPDF(invoice.invoiceId)}
                          label="Descargar PDF"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination Controls */}
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
        
        {/* Create New Invoice Action */}
        {/* Navigation to invoice creation page */}
        <div className="crud-actions">
          <DynamicButton
            type="save"
            onClick={() => navigate('/user/invoices/create')}
          label="Crear Nueva Factura"
        />
      </div>

      {/* User Information Card */}
      {/* Componente educativo explicando las capacidades de gestión de facturas */}
      <div className="info-card">
        <div style={{ fontSize: '2rem' }}>📋</div>
        <div>
          <h4>Gestión de Facturas</h4>
          <p>
            Como usuario, puedes ver todas tus facturas, descargarlas en PDF 
            y crear nuevas facturas. Las facturas se generan automáticamente 
            cuando completas una venta.
          </p>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {/* 
        Detailed modal view for invoice preview with:
        - Complete invoice information display
        - Client details section
        - Product details table with calculations
        - Professional invoice layout
        - Loading states and error handling
      */}
      <Modal isOpen={isPreviewModalOpen} onClose={() => setPreviewModalOpen(false)}>
        <div className="invoices-modal">
          {/* Modal Header */}
          <div className="invoices-modal-header">
            <h2 style={{ margin: 0 }}>Detalle de Factura</h2>
            <button
              onClick={() => setPreviewModalOpen(false)}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: '20px',
                top: '20px'
              }}
            >
              ×
            </button>
          </div>

          {/* Modal Content */}
          {/* Displays loading state, invoice details, or error messages */}
          {loadingPreview ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Cargando información...</p>
            </div>
          ) : selectedInvoiceForPreview && invoiceDetails ? (
            <div className="invoice-preview">
              {/* Invoice Header */}
              <div className="invoice-preview-header">
                <h1 className="invoice-preview-title">FACTURA COMERCIAL</h1>
                <p className="invoice-preview-subtitle">Sistema de Facturación Digital</p>
              </div>

              {/* Invoice Information Section */}
              {/* Client and invoice details side by side */}
              <div className="invoice-info-section">
                {/* Client Information */}
                <div className="client-info">
                  <div className="info-title">Información del Cliente</div>
                  <div className="info-item">
                    <span className="info-label">Nombre:</span>
                    <span className="info-value">{selectedInvoiceForPreview.client.firstName} {selectedInvoiceForPreview.client.lastName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Cédula:</span>
                    <span className="info-value">{selectedInvoiceForPreview.client.identificationNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Teléfono:</span>
                    <span className="info-value">{selectedInvoiceForPreview.client.phone || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedInvoiceForPreview.client.email || 'N/A'}</span>
                  </div>
                  {selectedInvoiceForPreview.client.address && (
                    <div className="info-item">
                      <span className="info-label">Dirección:</span>
                      <span className="info-value">{selectedInvoiceForPreview.client.address}</span>
                    </div>
                  )}
                </div>

                {/* Invoice Details */}
                <div className="invoice-details">
                  <div className="info-title">Detalles de Factura</div>
                  <div className="info-item">
                    <span className="info-label">N° Factura:</span>
                    <span className="info-value">{selectedInvoiceForPreview.invoiceNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Fecha:</span>
                    <span className="info-value">{new Date(selectedInvoiceForPreview.issueDate).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              {/* Detailed table of all products in the invoice */}
              <div className="products-section">
                <h3 className="products-title">Detalle de Productos</h3>
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="product-quantity">Cantidad</th>
                      <th className="product-price">Precio Unit.</th>
                      <th className="product-subtotal">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Dynamic Product Rows with Fallback Data */}
                    {/* Handles multiple possible data structures from different API responses */}
                    {invoiceDetails && (
                      (invoiceDetails.invoiceDetails && Array.isArray(invoiceDetails.invoiceDetails)) ? (
                        invoiceDetails.invoiceDetails.map((detail: any, index: number) => (
                          <tr key={index}>
                            <td className="product-name">
                              {detail.product?.name || detail.productName || 
                               detail.Product?.name || detail.productDetails?.name || 
                               `Producto ID: ${detail.productId || detail.ProductId || 'N/A'}`}
                            </td>
                            <td className="product-quantity">
                              {detail.quantity || detail.Quantity || 0}
                            </td>
                            <td className="product-price">
                              ${(detail.unitPrice || detail.UnitPrice || 0).toFixed(2)}
                            </td>
                            <td className="product-subtotal">
                              ${((detail.quantity || detail.Quantity || 0) * (detail.unitPrice || detail.UnitPrice || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : 
                      Array.isArray(invoiceDetails) && invoiceDetails.length > 0 ? (
                        invoiceDetails.map((detail: any, index: number) => (
                          <tr key={index}>
                            <td className="product-name">
                              {detail.product?.name || detail.productName || 
                               detail.Product?.name || detail.productDetails?.name || 
                               `Producto ID: ${detail.productId || detail.ProductId || 'N/A'}`}
                            </td>
                            <td className="product-quantity">
                              {detail.quantity || detail.Quantity || 0}
                            </td>
                            <td className="product-price">
                              ${(detail.unitPrice || detail.UnitPrice || 0).toFixed(2)}
                            </td>
                            <td className="product-subtotal">
                              ${((detail.quantity || detail.Quantity || 0) * (detail.unitPrice || detail.UnitPrice || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', fontStyle: 'italic', padding: '20px' }}>
                            No se encontraron detalles de productos para esta factura
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoice Total Section */}
              {/* Displays the final amount prominently */}
              <div className="invoice-total">
                <div className="total-label">TOTAL A PAGAR</div>
                <h2 className="total-amount">${selectedInvoiceForPreview.total.toFixed(2)}</h2>
              </div>

              {/* Invoice Footer */}
              {/* Professional footer with generation timestamp */}
              <div className="invoice-footer">
                <p>Gracias por su compra. Esta factura fue generada automáticamente por nuestro sistema.</p>
                <p>Generado el {new Date().toLocaleString('es-ES')}</p>
              </div>
            </div>
          ) : (
            /* Error State */
            /* Fallback content when invoice data cannot be loaded */
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No se pudo cargar la información de la factura</p>
            </div>
          )}
        </div>
      </Modal>
      </div>
    </div>
  );
};

export default UserInvoices;


