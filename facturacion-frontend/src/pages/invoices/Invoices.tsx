import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import DynamicButton from '../../components/common/DynamicButton';
import { notifications, confirmAction } from '../../utils/notifications';
import { useInvoices } from '../../hooks/useInvoices';
import { invoiceService } from '../../services/invoiceService';
import { productService } from '../../services/productService';
import type { InvoiceDto } from '../../@types/invoices';
import '../../assets/styles/Invoices.css';

const InvoicesCRUD: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<InvoiceDto | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const itemsPerPage = 10;

  const { invoices, totalItems, loading, searching, error } = useInvoices({
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
  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      const invoiceDetails = await invoiceService.getInvoiceDetails(invoiceId);
      const invoice = invoices.find((inv) => inv.invoiceId === invoiceId);
      if (!invoice) throw new Error('Factura no encontrada');

      // Enriquecer los detalles con nombres de productos
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

  const handlePreviewInvoice = async (invoiceId: number) => {
    try {
      setLoadingPreview(true);
      
      // Encontrar la factura en la lista actual para tener datos básicos
      const invoice = invoices.find(inv => inv.invoiceId === invoiceId);
      if (!invoice) {
        notifications.error('Factura no encontrada');
        return;
      }
      
      console.log('Factura encontrada:', invoice);
      
      let enrichedDetails = null;      try {
        // Intentar obtener la factura completa
        const fullInvoice = await invoiceService.getInvoiceById(invoiceId);
        console.log('Factura completa obtenida:', fullInvoice);
        
        // Si la factura completa tiene detalles pero no los nombres de productos, enriquecerlos
        if (fullInvoice && (fullInvoice as any).invoiceDetails && Array.isArray((fullInvoice as any).invoiceDetails)) {
          const productCache = new Map<number, any>();
          
          const enrichedInvoiceDetails = await Promise.all(
            (fullInvoice as any).invoiceDetails.map(async (detail: any) => {
              try {
                const productId = detail.productId || detail.ProductId;
                if (productId && (!detail.product?.name && !detail.productName && !detail.Product?.name)) {
                  // Solo obtener producto si no tenemos el nombre
                  if (productCache.has(productId)) {
                    const cachedProduct = productCache.get(productId);
                    return {
                      ...detail,
                      product: cachedProduct,
                      productName: cachedProduct?.name
                    };
                  }
                  
                  const product = await productService.getProductById(productId);
                  console.log(`Producto obtenido para ID ${productId}:`, product);
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
        console.log('Error al obtener factura completa, intentando con detalles:', invoiceError);
        
        try {
          // Obtener detalles básicos
          const details = await invoiceService.getInvoiceDetails(invoiceId);
          console.log('Detalles básicos obtenidos:', details);
            // Enriquecer con información de productos usando el endpoint específico
          if (Array.isArray(details) && details.length > 0) {
            // Crear un cache para evitar llamadas duplicadas al mismo producto
            const productCache = new Map<number, any>();
            
            const enrichedDetailsPromises = details.map(async (detail: any) => {
              try {
                const productId = detail.productId || detail.ProductId;
                if (productId) {
                  // Verificar si ya tenemos el producto en cache
                  if (productCache.has(productId)) {
                    const cachedProduct = productCache.get(productId);
                    return {
                      ...detail,
                      product: cachedProduct,
                      productName: cachedProduct?.name || `Producto ID: ${productId}`
                    };
                  }
                  
                  // Obtener información del producto por ID directamente
                  const product = await productService.getProductById(productId);
                  console.log(`Producto obtenido para ID ${productId}:`, product);
                  
                  // Guardar en cache
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
                console.log(`Error al obtener producto ID ${detail.productId || detail.ProductId}:`, productError);
                return {
                  ...detail,
                  productName: `Producto no disponible (ID: ${detail.productId || detail.ProductId || 'N/A'})`
                };
              }
            });
            
            enrichedDetails = await Promise.all(enrichedDetailsPromises);
            console.log('Detalles enriquecidos:', enrichedDetails);
          } else {
            enrichedDetails = details;
          }
        } catch (detailsError) {
          console.log('Error al obtener detalles:', detailsError);
          enrichedDetails = [];
        }
      }
      
      setSelectedInvoiceForPreview(invoice);
      setInvoiceDetails(enrichedDetails);
      setPreviewModalOpen(true);
    } catch (err) {
      notifications.error('Error al cargar la previsualización de la factura');
      console.error('Error:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="invoices-crud">
      <Navbar />      <h1>Gestión de Facturas</h1>
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
      {loading && invoices.length === 0 && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}      <div className="table-container">
        <div className="invoices-table-container">
          <table className="invoices-table">
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
              {invoices.map((invoice) => (
                <tr key={invoice.invoiceId}>
                  <td className="text-right">{invoice.invoiceId}</td>
                  <td className="text-left">{invoice.invoiceNumber}</td>
                  <td className="text-left">{`${invoice.client.firstName} ${invoice.client.lastName}`}</td>
                  <td className="text-left">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                  <td className="text-right number-format">${invoice.total.toFixed(2)}</td>
                  <td className="text-left">
                    <div className="actions-cell">
                      <DynamicButton
                        type="edit"
                        onClick={() => handlePreviewInvoice(invoice.invoiceId)}
                        label="Previsualizar"
                      />
                      <DynamicButton
                        type="save"
                        onClick={() => handleDownloadPDF(invoice.invoiceId)}
                        label="Descargar Factura"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      </div>      <div className="crud-actions">
        <DynamicButton
          type="save" // Cambiado a un tipo válido
          onClick={() => navigate('/factura/nueva')}
          label="Crear Factura"
        />
      </div>      {/* Modal de previsualización */}
      <Modal isOpen={isPreviewModalOpen} onClose={() => setPreviewModalOpen(false)}>
        <div className="invoices-modal">
          <div className="invoices-modal-header">
            <h2 style={{ margin: 0 }}>Previsualización de Factura</h2>
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

          {loadingPreview ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Cargando previsualización...</p>
            </div>
          ) : selectedInvoiceForPreview && invoiceDetails ? (
            <div className="invoice-preview">
              {/* Header de la factura */}
              <div className="invoice-preview-header">
                <h1 className="invoice-preview-title">FACTURA COMERCIAL</h1>
                <p className="invoice-preview-subtitle">Sistema de Facturación Digital</p>
              </div>

              {/* Información de la factura y cliente */}
              <div className="invoice-info-section">
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

              {/* Tabla de productos */}
              <div className="products-section">
                <h3 className="products-title">Detalle de Productos</h3>
                <table className="products-table">
                  <thead>
                    <tr>
                      <th className="text-left">Producto</th>
                      <th className="text-left">Código</th>
                      <th className="text-right">Cantidad</th>
                      <th className="text-right">Precio Unit.</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceDetails && (
                      // Si invoiceDetails es un objeto con propiedad invoiceDetails (factura completa)
                      (invoiceDetails.invoiceDetails && Array.isArray(invoiceDetails.invoiceDetails)) ? (
                        invoiceDetails.invoiceDetails.map((detail: any, index: number) => (
                          <tr key={index}>
                            <td className="text-left">
                              {detail.product?.name || detail.productName || 
                               detail.Product?.name || detail.productDetails?.name || 
                               `Producto ID: ${detail.productId || detail.ProductId || 'N/A'}`}
                            </td>
                            <td className="text-left">
                              {detail.product?.code || detail.productCode || 
                               detail.Product?.code || detail.productDetails?.code || 
                               detail.productId || detail.ProductId || 'N/A'}
                            </td>
                            <td className="text-right">
                              {detail.quantity || detail.Quantity || 0}
                            </td>
                            <td className="text-right">
                              ${(detail.unitPrice || detail.UnitPrice || 0).toFixed(2)}
                            </td>
                            <td className="text-right">
                              ${((detail.quantity || detail.Quantity || 0) * (detail.unitPrice || detail.UnitPrice || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : 
                      // Si invoiceDetails es un arreglo directo (datos enriquecidos)
                      Array.isArray(invoiceDetails) && invoiceDetails.length > 0 ? (
                        invoiceDetails.map((detail: any, index: number) => (
                          <tr key={index}>
                            <td className="text-left">
                              {detail.product?.name || detail.productName || 
                               detail.Product?.name || detail.productDetails?.name || 
                               `Producto ID: ${detail.productId || detail.ProductId || 'N/A'}`}
                            </td>
                            <td className="text-left">
                              {detail.product?.code || detail.productCode || 
                               detail.Product?.code || detail.productDetails?.code || 
                               detail.productId || detail.ProductId || 'N/A'}
                            </td>
                            <td className="text-right">
                              {detail.quantity || detail.Quantity || 0}
                            </td>
                            <td className="text-right">
                              ${(detail.unitPrice || detail.UnitPrice || 0).toFixed(2)}
                            </td>
                            <td className="text-right">
                              ${((detail.quantity || detail.Quantity || 0) * (detail.unitPrice || detail.UnitPrice || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', fontStyle: 'italic', padding: '20px' }}>
                            No se encontraron detalles de productos para esta factura
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="invoice-total">
                <div className="total-label">TOTAL A PAGAR</div>
                <h2 className="total-amount">${selectedInvoiceForPreview.total.toFixed(2)}</h2>
              </div>

              {/* Footer */}
              <div className="invoice-footer">
                <p>Gracias por su compra. Esta factura fue generada automáticamente por nuestro sistema.</p>
                <p>Generado el {new Date().toLocaleString('es-ES')}</p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No se pudo cargar la información de la factura</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default InvoicesCRUD;



