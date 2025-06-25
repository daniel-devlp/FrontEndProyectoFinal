import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import DynamicButton from '../../components/common/DynamicButton';
import { invoiceService } from '../../services/invoiceService';
import { notifications, confirmAction, withLoadingToast } from '../../utils/notifications';
import type { InvoiceCreateDto, ClientDto, ProductDto, InvoiceDetailDto } from '../../@types/invoices';
import { useClients } from '../../hooks/useClients';
import { useProducts } from '../../hooks/useProducts';
import { useUsers } from '../../hooks/useUsers';
import axios from 'axios';
import '../../assets/styles/InvoiceCreatePage.css';

const InvoiceCreatePage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [isClientModalOpen, setClientModalOpen] = useState<boolean>(false);
  const [isProductModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Array<ProductDto & { quantity: number }>>([]);
  const [newInvoice, setNewInvoice] = useState<InvoiceCreateDto>({
    invoiceNumber: '',
    clientId: 0,
    userId: '',
    issueDate: new Date().toISOString(),
    observations: '',
    invoiceDetails: [],
  });
  const itemsPerPage = 10;  // Función para manejar el cambio de búsqueda y resetear la página
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear siempre a la página 1 cuando se busque
  };

  // Función para manejar el cambio de búsqueda de productos
  const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductSearchTerm(e.target.value);
  };

  // Funciones para abrir modales y resetear búsqueda
  const openClientModal = () => {
    setSearchTerm(''); // Limpiar búsqueda anterior
    setCurrentPage(1); // Resetear página
    setClientModalOpen(true);
  };

  const openProductModal = () => {
    setProductSearchTerm(''); // Limpiar búsqueda anterior
    setProductModalOpen(true);
  };

  const closeClientModal = () => {
    setSearchTerm(''); // Limpiar búsqueda al cerrar
    setCurrentPage(1); // Resetear página
    setClientModalOpen(false);
  };

  const closeProductModal = () => {
    setProductSearchTerm(''); // Limpiar búsqueda al cerrar
    setProductModalOpen(false);
  };
  const { clients, totalItems: totalClients, loading: loadingClients, error: errorClients } = useClients({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    searchTerm,
  });  // Hook para productos - obtener TODOS los productos de una vez
  const { products: allProducts, totalItems: totalProducts, loading: loadingProducts, error: errorProducts } = useProducts({
    pageNumber: 1,
    pageSize: 1000, // Obtener muchos productos de una vez
    searchTerm: '', // Sin filtro para obtener todos los productos
  });

  // Filtrar productos localmente para la búsqueda
  // MOSTRAR TODOS los productos con stock > 0 (sin paginación en el modal)
  const displayProducts = productSearchTerm 
    ? allProducts.filter(product =>
        product.stock > 0 && // ✅ Solo productos con stock disponible
        (product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(productSearchTerm.toLowerCase()))
      )
    : allProducts.filter(product => product.stock > 0); // ✅ TODOS los productos con stock disponible

  // No necesitamos paginación para productos ya que mostramos todos
  const effectiveTotalProducts = displayProducts.length;
  const effectiveTotalPages = 1; // Solo una página porque mostramos todos

  const { currentUserId } = useUsers();

  useEffect(() => {
    if (currentUserId) {
      setNewInvoice((prev) => ({ ...prev, userId: currentUserId }));
    }
  }, [currentUserId]);
  const handleSelectClient = (client: ClientDto) => {
    setSelectedClient(client);
    setNewInvoice((prev) => ({ ...prev, clientId: client.clientId }));
    notifications.success(`Cliente seleccionado: ${client.firstName} ${client.lastName}`);
    closeClientModal();
  };  const handleSelectProduct = (product: ProductDto) => {
    // Verificar si el producto tiene stock disponible
    if (product.stock <= 0) {
      notifications.error(`El producto ${product.name} no tiene stock disponible`);
      return;
    }

    // Verificar si el producto ya está en la lista
    const existingProduct = selectedProducts.find((p) => p.productId === product.productId);
    if (existingProduct) {
      notifications.error(`El producto ${product.name} ya está agregado a la factura`);
      return;
    }

    // Crear una copia completa del producto sin modificar el stock original
    const productCopy: ProductDto & { quantity: number } = {
      ...product, // Mantener todos los datos originales del producto, incluyendo el stock completo
      quantity: 1 // Solo agregar la propiedad quantity
    };

    // Agregar producto con cantidad inicial de 1
    const productDetail: InvoiceDetailDto = {
      productId: product.productId,
      quantity: 1,
      unitPrice: product.price,
    };

    setSelectedProducts((prev) => [...prev, productCopy]);
    setNewInvoice((prev) => ({
      ...prev,
      invoiceDetails: [...prev.invoiceDetails, productDetail],
    }));    
    notifications.success(`Producto agregado: ${product.name}`);
    closeProductModal();
  };

  // Validamos el objeto `newInvoice` antes de enviarlo
  const validateInvoice = (invoice: InvoiceCreateDto): string | null => {
    if (!invoice.invoiceNumber) return 'El número de factura es obligatorio';
    if (!invoice.clientId || invoice.clientId <= 0) return 'El ID del cliente es obligatorio y debe ser válido';
    if (!invoice.userId) return 'El ID del usuario es obligatorio';
    if (!invoice.issueDate) return 'La fecha de emisión es obligatoria';
    if (invoice.invoiceDetails.length === 0) return 'Debe agregar al menos un producto';

    for (const detail of invoice.invoiceDetails) {
      if (!detail.productId || detail.productId <= 0) return 'El ID del producto es obligatorio y debe ser válido';
      if (!detail.quantity || detail.quantity <= 0) return 'La cantidad es obligatoria y debe ser mayor a 0';
      if (!detail.unitPrice || detail.unitPrice <= 0) return 'El precio unitario es obligatorio y debe ser mayor a 0';
    }

    return null;
  };

  const generateUniqueInvoiceNumber = async (): Promise<string> => {
    try {
      const response = await invoiceService.getAllInvoices({ pageNumber: 1, pageSize: 1000, searchTerm: '' });
      const existingNumbers = response.data.map((invoice) => parseInt(invoice.invoiceNumber, 10));
      let newInvoiceNumber = 1;

      while (existingNumbers.includes(newInvoiceNumber)) {
        newInvoiceNumber++;
      }

      const formattedInvoiceNumber = newInvoiceNumber.toString().padStart(8, '0');
      return formattedInvoiceNumber;
    } catch (error) {
      console.error('Error al generar el número de factura:', error);
      notifications.error('Error al generar el número de factura');
      return '00000001'; // Fallback en caso de error
    }
  };

  useEffect(() => {
    // Set a provisional invoice number immediately
    setNewInvoice((prev) => ({ ...prev, invoiceNumber: '00000001' }));

    const initializeInvoiceNumber = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate 0.01 seconds delay
      const generatedInvoiceNumber = await generateUniqueInvoiceNumber();
      setNewInvoice((prev) => ({ ...prev, invoiceNumber: generatedInvoiceNumber }));
    };

    initializeInvoiceNumber();
  }, []);
  const handleSaveInvoice = async () => {
    // Confirmación antes de guardar
    const confirmed = await confirmAction(
      '¿Estás seguro de que deseas guardar esta factura?',
      'Confirmar Creación de Factura'
    );
    if (!confirmed) return;

    if (!newInvoice.invoiceNumber) {
      const generatedInvoiceNumber = await generateUniqueInvoiceNumber();
      setNewInvoice((prev) => ({ ...prev, invoiceNumber: generatedInvoiceNumber }));
    }

    if (!newInvoice.userId) {
      notifications.error('El ID del usuario es obligatorio. Intente nuevamente.');
      return;
    }

    const validationError = validateInvoice(newInvoice);
    if (validationError) {
      notifications.error(validationError);
      return;
    }

    try {
      await withLoadingToast(
        () => invoiceService.createInvoice(newInvoice),
        'Creando factura...',
        'Factura creada exitosamente'
      );

      // Clear all data except the invoice number
      setNewInvoice((prev) => ({
        invoiceNumber: prev.invoiceNumber,
        clientId: 0,
        userId: '',
        issueDate: new Date().toISOString(),
        observations: '',
        invoiceDetails: [],
      }));
      setSelectedClient(null);
      setSelectedProducts([]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const serverMessage = error.response.data?.message || 'Error desconocido en el servidor';
        console.error('Detalles del error:', error.response.data);
        notifications.error(`Error al crear la factura: ${serverMessage}`);
      } else {
        notifications.error('Error inesperado al crear la factura');
      }
    }
  };

  const handleDownloadInvoice = () => {
    if (!selectedClient) {
      notifications.error('Debe seleccionar un cliente antes de descargar la factura');
      return;
    }

    // Enrich invoice details with product names and codes
    const enrichedDetails = newInvoice.invoiceDetails.map(detail => {
      const product = allProducts.find(p => p.productId === detail.productId);
      return {
        ...detail,
        productName: product?.name || `Producto ID: ${detail.productId}`,
        productCode: product?.code || detail.productId.toString()
      };
    });

    invoiceService.generateInvoicePDF(
      {
        name: `${selectedClient.firstName} ${selectedClient.lastName}`,
        email: selectedClient.email || '',
        phone: selectedClient.phone || '',
      },
      enrichedDetails,
      newInvoice.invoiceDetails.reduce((total, detail) => total + detail.unitPrice * detail.quantity, 0)
    );
  };  const handleQuantityChange = (productId: number, newQuantity: number) => {
    // Validaciones solo para cantidades mayores a 0
    if (newQuantity > 0) {
      if (newQuantity < 1) {
        notifications.error('La cantidad debe ser al menos 1');
        return;
      }      // Obtener el stock del producto
      const product = allProducts.find(p => p.productId === productId);
      if (product && newQuantity > product.stock) {
        notifications.error(`La cantidad no puede exceder el stock disponible (${product.stock})`);
        return;
      }
    }

    // Actualizar cantidad en selectedProducts
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, quantity: newQuantity } : p
      )
    );

    // Solo actualizar invoiceDetails si la cantidad es válida (mayor a 0)
    if (newQuantity > 0) {
      setNewInvoice((prev) => ({
        ...prev,
        invoiceDetails: prev.invoiceDetails.map((detail) =>
          detail.productId === productId
            ? { ...detail, quantity: newQuantity }
            : detail
        ),
      }));
    } else {
      // Si la cantidad es 0 (campo vacío), mantener la cantidad anterior en invoiceDetails
      // para no afectar los cálculos hasta que se ingrese una cantidad válida
      const currentProduct = selectedProducts.find(p => p.productId === productId);
      if (currentProduct && currentProduct.quantity > 0) {
        setNewInvoice((prev) => ({
          ...prev,
          invoiceDetails: prev.invoiceDetails.map((detail) =>
            detail.productId === productId
              ? { ...detail, quantity: currentProduct.quantity }
              : detail
          ),
        }));
      }
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
    setNewInvoice((prev) => ({
      ...prev,
      invoiceDetails: prev.invoiceDetails.filter((detail) => detail.productId !== productId),
    }));    
    const product = allProducts.find(p => p.productId === productId);
    if (product) {
      notifications.success(`Producto removido: ${product.name}`);
    }
  };
  const calculateSubtotal = () => {
    return newInvoice.invoiceDetails.reduce(
      (total, detail) => total + detail.unitPrice * detail.quantity,
      0
    );
  };

  const calculateIVA = () => {
    return calculateSubtotal() * 0.12;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateIVA();
  };
  // Ajustamos el tipo de datos para garantizar que las propiedades estén disponibles
  const clientsWithFullDetails = clients.map((client) => ({
    ...client,
    identificationNumber: client.identificationNumber || '',
    address: client.address || '',
    fullName: `${client.firstName} ${client.lastName}`,
  }));
  return (
    <div className="invoice-create">
      <Navbar />
      <div className="main-layout">
        <div className="content">
          <div className="invoice-dashboard">
            <div className="section">
              <h1>Crear Nueva Factura</h1>
            </div>
              <div className="section">
              <h2>Información de la Factura</h2>
              <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                <div>
                  <p><strong>Número de Factura:</strong></p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                    {newInvoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p><strong>Fecha de Emisión:</strong></p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                    {new Date(newInvoice.issueDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

          {/* Selección de Cliente */}
          <div className="section">
            <h2>Cliente</h2>
            {selectedClient ? (
              <div>
                <p><strong>Cédula:</strong> {selectedClient.identificationNumber}</p>
                <p><strong>Nombre Completo:</strong> {selectedClient.firstName} {selectedClient.lastName}</p>
                <p><strong>Dirección:</strong> {selectedClient.address}</p>
                <p><strong>Teléfono:</strong> {selectedClient.phone}</p>
              </div>
            ) : (
              <p>No se ha seleccionado un cliente</p>
            )}            <DynamicButton
              type="save"
              onClick={openClientModal}
              label="Seleccionar Cliente"
            />
          </div>        {/* Modal para seleccionar cliente */}
        <Modal isOpen={isClientModalOpen} onClose={closeClientModal}>
          <div style={{ position: 'relative' }}>
            <button
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={closeClientModal}
            >
              X
            </button>            <h2>Seleccionar Cliente</h2>
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <SearchBar
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div><DynamicButton
                type="save"                onClick={() => {
                  closeClientModal();
                  navigate('/admin/clients');
                }}
                label="Crear Cliente"
              />
            </div>
            {loadingClients ? (
              <p>Cargando clientes...</p>
            ) : errorClients ? (
              <p>Error: {errorClients}</p>            ) : (
              <div className="clients-select-table-container">
                <table className="clients-select-table">
                  <thead>
                    <tr>
                      <th>Cédula</th>
                      <th>Nombre Completo</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsWithFullDetails.map((client) => (
                      <tr key={client.clientId}>
                        <td className="text-left">{client.identificationNumber}</td>
                        <td className="text-left">{client.fullName}</td>
                        <td className="text-left">{client.phone}</td>
                        <td className="text-left">
                          <DynamicButton
                            type="save"
                            onClick={() => handleSelectClient(client)}
                            label="Seleccionar"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pagination-controls">
              <button
                disabled={currentPage === 1 || loadingClients}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Anterior
              </button>
              <span>Página {currentPage} de {Math.ceil(totalClients / itemsPerPage)}</span>
              <button
                disabled={currentPage === Math.ceil(totalClients / itemsPerPage) || loadingClients}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </Modal>

          {/* Selección de Productos */}
          <div className="section">          
            <h2>Productos</h2>          
            {selectedProducts.length > 0 && (
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px', fontStyle: 'italic' }}>
                💡 Doble clic en una fila para eliminar el producto
              </p>
            )}
            {selectedProducts.length > 0 ? (
            <div className="table-container">
              <div className="table-wrapper">
                <table className="invoice-table">
                <thead>
                  <tr>
                    <th className="text-left" style={{ width: '15%' }}>Código</th>
                    <th className="text-left" style={{ width: '30%' }}>Nombre</th>
                    <th className="text-center" style={{ width: '12%' }}>Cant.</th>
                    <th className="text-right" style={{ width: '13%' }}>Stock</th>
                    <th className="text-right" style={{ width: '15%' }}>Precio Unit.</th>
                    <th className="text-right" style={{ width: '15%' }}>Subtotal</th>
                  </tr>
                </thead>                <tbody>
                  {selectedProducts.map((product) => {
                    // Obtener el stock real del producto desde allProducts (sin modificar)
                    const stockReal = allProducts.find(p => p.productId === product.productId)?.stock || product.stock || 0;
                    // Obtener el código del producto
                    const productCode = allProducts.find(p => p.productId === product.productId)?.code || (product as any).code || '';
                    return (
                      <tr 
                        key={product.productId}
                        onDoubleClick={async () => {
                          const confirmed = await confirmAction(
                            `¿Estás seguro de que deseas eliminar ${product.name} de la factura?`,
                            'Confirmar Eliminación de Producto'
                          );
                          if (confirmed) {
                            handleRemoveProduct(product.productId);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Doble clic para eliminar este producto"
                      >
                        <td className="text-left" style={{ width: '15%' }}>{productCode}</td>
                        <td className="text-left" style={{ width: '30%' }} title={product.name}>{product.name}</td>
                        <td className="text-center" style={{ width: '12%' }}>                          <input
                            type="number"
                            min="1"
                            max={stockReal}
                            value={product.quantity === 0 ? '' : product.quantity}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              
                              // Si el campo está vacío, permitir que se quede vacío temporalmente
                              if (inputValue === '') {
                                // Actualizar temporalmente a 0 para mostrar campo vacío
                                setSelectedProducts((prev) =>
                                  prev.map((p) =>
                                    p.productId === product.productId ? { ...p, quantity: 0 } : p
                                  )
                                );
                                return;
                              }
                              
                              const newQuantity = parseInt(inputValue);
                              
                              // Validar que sea un número válido
                              if (isNaN(newQuantity)) {
                                return;
                              }
                              
                              // Validar rango y actualizar
                              if (newQuantity >= 1 && newQuantity <= stockReal) {
                                handleQuantityChange(product.productId, newQuantity);
                              } else if (newQuantity > stockReal) {
                                notifications.error(`La cantidad no puede exceder el stock disponible (${stockReal})`);
                                // No actualizar el valor si excede el stock
                              } else if (newQuantity < 1) {
                                notifications.error('La cantidad debe ser al menos 1');
                                // No actualizar el valor si es menor a 1
                              }
                            }}
                            onBlur={(e) => {
                              // Al perder el foco, asegurar que tenga un valor válido
                              const inputValue = e.target.value;
                              if (inputValue === '' || parseInt(inputValue) < 1 || isNaN(parseInt(inputValue))) {
                                handleQuantityChange(product.productId, 1);
                                notifications.info('Cantidad ajustada a 1 (mínimo permitido)');
                              }
                            }}
                            onKeyDown={(e) => {
                              // Permitir: backspace, delete, tab, escape, enter
                              if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                                  // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                  (e.keyCode === 65 && e.ctrlKey === true) ||
                                  (e.keyCode === 67 && e.ctrlKey === true) ||
                                  (e.keyCode === 86 && e.ctrlKey === true) ||
                                  (e.keyCode === 88 && e.ctrlKey === true) ||
                                  // Permitir: home, end, left, right, down, up
                                  (e.keyCode >= 35 && e.keyCode <= 40)) {
                                return;
                              }
                              // Asegurar que sea un número (0-9)
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                              }
                            }}
                            style={{
                              width: '60px',
                              padding: '6px 8px',
                              border: '2px solid #e0e0e0',
                              borderRadius: '6px',
                              textAlign: 'center',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              transition: 'all 0.3s ease',
                              backgroundColor: '#ffffff',
                              color: '#333333'
                            }}
                            placeholder="1"
                          />
                        </td>
                        <td className="text-right" style={{ width: '13%' }}>{stockReal}</td>
                        <td className="text-right" style={{ width: '15%' }}>${product.price.toFixed(2)}</td>
                        <td className="text-right" style={{ width: '15%' }}>${product.quantity > 0 ? (product.price * product.quantity).toFixed(2) : '0.00'}</td>
                      </tr>
                    );                  })}                </tbody></table>
              
                {/* Tabla de totales en la parte baja derecha */}
                <div className="totals-container">
                  <table className="invoice-totals-summary">
                    <tbody>
                      <tr>
                        <td>Subtotal:</td>
                        <td className="amount">${calculateSubtotal().toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>IVA (12%):</td>
                        <td className="amount">${calculateIVA().toFixed(2)}</td>
                      </tr>
                      <tr className="total-row">
                        <td>TOTAL:</td>
                        <td className="amount">${calculateTotal().toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>) : (
            <p>No se han agregado productos</p>          )}
          <DynamicButton
            type="save"
            onClick={openProductModal}
            label="Agregar Producto"
          />
        </div>

        {/* Modal para seleccionar producto */}
        <Modal isOpen={isProductModalOpen} onClose={closeProductModal}>
          <div style={{ position: 'relative' }}>
            <button
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={closeProductModal}
            >
              X
            </button>            <h2>Seleccionar Producto</h2>
            <SearchBar
              placeholder="Buscar productos..."
              value={productSearchTerm}
              onChange={handleProductSearchChange}
            />
            {loadingProducts ? (
              <p>Cargando productos...</p>
            ) : errorProducts ? (
              <p>Error: {errorProducts}</p>            ) : (
              <div className="products-select-table-container">
                <table className="products-select-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>                  </thead>                  <tbody>
                    {displayProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center" style={{ padding: '20px', fontStyle: 'italic', color: '#666' }}>
                          {productSearchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos disponibles'}
                        </td>
                      </tr>
                    ) : (
                      displayProducts.map((product) => (
                        <tr key={product.productId}>
                          <td className="text-left">{product.code}</td>
                          <td className="text-left">{product.name}</td>
                          <td className="text-right number-format">${product.price.toFixed(2)}</td>
                          <td className="text-right">{product.stock}</td>
                          <td className="text-left">
                            {selectedProducts.some(selected => selected.productId === product.productId) ? (
                              <span className="product-added">✓ Agregado</span>
                            ) : (
                              <DynamicButton
                                type="save"
                                onClick={() => handleSelectProduct(product)}
                                label="Seleccionar"
                              />
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>        </Modal>

        {/* Acciones finales */}
        <div className="section">
          <div className="form-actions">
            <DynamicButton
              type="save"
              onClick={handleSaveInvoice}
              label="Guardar Factura"
            />
           
          </div>
        </div>
      </div>    </div>
  </div>
</div>
  );
};

export default InvoiceCreatePage;


