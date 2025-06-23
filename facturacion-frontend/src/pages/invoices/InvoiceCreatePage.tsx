import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import DynamicButton from '../../components/common/DynamicButton';
import { invoiceService } from '../../services/invoiceService';
import { toast } from 'react-toastify';
import type { InvoiceCreateDto, ClientDto, ProductDto, InvoiceDetailDto } from '../../@types/invoices';
import { useClients } from '../../hooks/useClients';
import { useProducts } from '../../hooks/useProducts';
import { useUsers } from '../../hooks/useUsers';
import axios from 'axios';
import '../../assets/styles/InvoiceCreatePage.css';

const InvoiceCreatePage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
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
  const itemsPerPage = 10;

  const { clients, totalItems: totalClients, loading: loadingClients, error: errorClients } = useClients({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    searchTerm,
  });

  const { products, totalItems: totalProducts, loading: loadingProducts, error: errorProducts } = useProducts({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    searchTerm,
  });

  const { currentUserId } = useUsers();

  useEffect(() => {
    if (currentUserId) {
      setNewInvoice((prev) => ({ ...prev, userId: currentUserId }));
    }
  }, [currentUserId]);

  const handleSelectClient = (client: ClientDto) => {
    setSelectedClient(client);
    setNewInvoice((prev) => ({ ...prev, clientId: client.clientId }));
    toast.success(`Cliente seleccionado: ${client.firstName} ${client.lastName}`);
    setClientModalOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectProduct = (product: ProductDto, quantity: number) => {
    if (quantity > product.stock) {
      toast.error('La cantidad excede el stock disponible');
      return;
    }

    const existingProduct = selectedProducts.find((p) => p.productId === product.productId);
    if (existingProduct) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.productId === product.productId
            ? { ...p, quantity: p.quantity + quantity }
            : p
        )
      );
      setNewInvoice((prev) => ({
        ...prev,
        invoiceDetails: prev.invoiceDetails.map((detail) =>
          detail.productId === product.productId
            ? { ...detail, quantity: detail.quantity + quantity }
            : detail
        ),
      }));
      toast.success(`Cantidad actualizada para el producto: ${product.name}`);
      return;
    }

    const productDetail: InvoiceDetailDto = {
      productId: product.productId,
      quantity,
      unitPrice: product.price,
    };

    setSelectedProducts((prev) => [...prev, { ...product, quantity }]);
    setNewInvoice((prev) => ({
      ...prev,
      invoiceDetails: [...prev.invoiceDetails, productDetail],
    }));
    toast.success(`Producto agregado: ${product.name}`);
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
      toast.error('Error al generar el número de factura');
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
    if (!newInvoice.invoiceNumber) {
      const generatedInvoiceNumber = await generateUniqueInvoiceNumber();
      setNewInvoice((prev) => ({ ...prev, invoiceNumber: generatedInvoiceNumber }));
    }

    if (!newInvoice.userId) {
      toast.error('El ID del usuario es obligatorio. Intente nuevamente.');
      return;
    }

    const validationError = validateInvoice(newInvoice);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await invoiceService.createInvoice(newInvoice);
      toast.success('Factura creada exitosamente');

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
        toast.error(`Error al crear la factura: ${serverMessage}`);
      } else {
        toast.error('Error inesperado al crear la factura');
      }
    }  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDownloadInvoice = () => {
    if (!selectedClient) {
      toast.error('Debe seleccionar un cliente antes de descargar la factura');
      return;
    }

    invoiceService.generateInvoicePDF(
      {
        name: `${selectedClient.firstName} ${selectedClient.lastName}`,
        email: selectedClient.email || '',
        phone: selectedClient.phone || '',
      },
      newInvoice.invoiceDetails,
      newInvoice.invoiceDetails.reduce((total, detail) => total + detail.unitPrice * detail.quantity, 0)
    );
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity < 1) {
      toast.error('La cantidad debe ser al menos 1');
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, quantity } : p
      )
    );
  };

  const calculateTotal = () => {
    return newInvoice.invoiceDetails.reduce(
      (total, detail) => total + detail.unitPrice * detail.quantity,
      0
    );
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
      <div className="content">
        <h1>Crear Nueva Factura</h1>
        <div className="section">
          <h2>Número de Factura</h2>
          <p>{newInvoice.invoiceNumber}</p>
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
          )}
          <DynamicButton
            type="save"
            onClick={() => setClientModalOpen(true)}
            label="Seleccionar Cliente"
          />
        </div>

        {/* Modal para seleccionar cliente */}
        <Modal isOpen={isClientModalOpen} onClose={() => setClientModalOpen(false)}>
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
              onClick={() => setClientModalOpen(false)}
            >
              X
            </button>
            <h2>Seleccionar Cliente</h2>
            <SearchBar
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loadingClients ? (
              <p>Cargando clientes...</p>
            ) : errorClients ? (
              <p>Error: {errorClients}</p>
            ) : (
              <Table
                columns={[
                  { key: 'identificationNumber', header: 'Cédula' },
                  { key: 'fullName', header: 'Nombre Completo' },
                  { key: 'phone', header: 'Teléfono' },
                ]}
                data={clientsWithFullDetails}
                renderActions={(client) => (
                  <DynamicButton
                    type="save"
                    onClick={() => handleSelectClient(client)}
                    label="Seleccionar"
                  />
                )}
              />
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
          {selectedProducts.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{product.price}</td>
                    <td>{(product.price * product.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No se han agregado productos</p>
          )}
          <p><strong>Total:</strong> ${calculateTotal().toFixed(2)}</p>
          <DynamicButton
            type="save"
            onClick={() => setProductModalOpen(true)}
            label="Agregar Producto"
          />
        </div>

        {/* Modal para seleccionar producto */}
        <Modal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)}>
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
              onClick={() => setProductModalOpen(false)}
            >
              X
            </button>
            <h2>Seleccionar Producto</h2>
            <SearchBar
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loadingProducts ? (
              <p>Cargando productos...</p>
            ) : errorProducts ? (
              <p>Error: {errorProducts}</p>
            ) : (
              <Table
                columns={[
                  { key: 'name', header: 'Nombre' },
                  { key: 'price', header: 'Precio' },
                  { key: 'stock', header: 'Stock' },
                 // { key: 'quantity', header: 'Cantidad' },
                ]}
                data={products.filter(product => product.stock > 0).map(product => ({ ...product, quantity: 1 }))}
                renderActions={(product) => (
                  <div>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={selectedProducts.find((p) => p.productId === product.productId)?.quantity || 1}
                      onChange={(e) => {
                        const newQuantity = Number(e.target.value);
                        if (newQuantity < 1) {
                          toast.error('La cantidad debe ser al menos 1');
                          return;
                        }
                        if (newQuantity > product.stock) {
                          toast.error('La cantidad excede el stock disponible');
                          return;
                        }
                        setSelectedProducts((prev) => {
                          const existingProduct = prev.find((p) => p.productId === product.productId);
                          if (existingProduct) {
                            return prev.map((p) =>
                              p.productId === product.productId ? { ...p, quantity: newQuantity } : p
                            );
                          }
                          return [...prev, { ...product, quantity: newQuantity }];
                        });
                      }}
                    />
                    <DynamicButton
                      type="save"
                      onClick={() => {
                        const selectedProduct = selectedProducts.find((p) => p.productId === product.productId);
                        if (selectedProduct) {
                          setNewInvoice((prev) => ({
                            ...prev,
                            invoiceDetails: [...prev.invoiceDetails, {
                              productId: product.productId,
                              quantity: selectedProduct.quantity,
                              unitPrice: product.price,
                            }],
                          }));
                          toast.success(`Producto agregado: ${product.name}`);
                        } else {
                          setNewInvoice((prev) => ({
                            ...prev,
                            invoiceDetails: [...prev.invoiceDetails, {
                              productId: product.productId,
                              quantity: 1,
                              unitPrice: product.price,
                            }],
                          }));
                          toast.success(`Producto agregado: ${product.name}`);
                        }
                      }}
                      label="Agregar"
                    />
                  </div>
                )}
              />
            )}
            <div className="pagination-controls">
              <button
                disabled={currentPage === 1 || loadingProducts}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Anterior
              </button>
              <span>Página {currentPage} de {Math.ceil(totalProducts / itemsPerPage)}</span>
              <button
                disabled={currentPage === Math.ceil(totalProducts / itemsPerPage) || loadingProducts}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </Modal>

        {/* Acciones finales */}
        <div className="form-actions">
          <DynamicButton
            type="save"
            onClick={handleSaveInvoice}
            label="Guardar Factura"
          />
          {/* <DynamicButton
            type="save"
            onClick={handleDownloadInvoice}
            label="Descargar Factura"
          /> */}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreatePage;
