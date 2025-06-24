import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import DynamicButton from '../../components/common/DynamicButton';
import { toast } from 'react-toastify';
import { useInvoices } from '../../hooks/useInvoices';
import { invoiceService } from '../../services/invoiceService';
import type { InvoiceDto } from '../../@types/invoices';
import '../../assets/styles/Invoices.css';

const InvoicesCRUD: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const { invoices, totalItems, loading, searching, error, deleteInvoice } = useInvoices({
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

      const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`;
      const total = invoice.total;

      invoiceService.generateInvoicePDF(
        { name: clientName, email: invoice.client.email ?? '', phone: invoice.client.phone ?? '' }, // Usar el operador nullish coalescing para valores predeterminados
        invoiceDetails,
        total
      );
      toast.success('Factura descargada exitosamente');
    } catch (err) {
      toast.error('Error al descargar la factura');
    }
  };

  const handleDelete = async (invoiceId: number) => {
    toast.info('¿Estás seguro de que deseas eliminar esta factura?', {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      position: "top-center",
      onClose: async () => {
        const confirmed = window.confirm('Confirma la eliminación de la factura.');        if (confirmed) {
          try {
            await deleteInvoice(invoiceId);
            toast.success('Factura eliminada exitosamente');
          } catch (err) {
            toast.error('Error al eliminar la factura');
          }
        } else {
          toast.info('Eliminación cancelada');
        }
      },
    });
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
      {error && <p>Error: {error}</p>}
      <Table
        columns={[
          { key: 'invoiceNumber', header: 'Número de Factura' },
          { key: 'clientName', header: 'Cliente' },
          { key: 'issueDate', header: 'Fecha de Emisión' },
          { key: 'total', header: 'Total' },
        ]}
        data={invoices.map((invoice) => ({
          invoiceId: invoice.invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          clientName: `${invoice.client.firstName} ${invoice.client.lastName}`,
          issueDate: new Date(invoice.issueDate).toLocaleDateString(),
          total: invoice.total.toFixed(2),
        }))}
        renderActions={(invoice) => (
          <>
              {/* <DynamicButton
                type="edit"
                onClick={() => navigate(`/factura/${invoice.invoiceId}/editar`)}
                label="Editar"
              />
              */}
            
            <DynamicButton
              type="save" // Cambiado a un tipo válido
              onClick={() => handleDownloadPDF(invoice.invoiceId)}
              label="Descargar Factura"
            />
          </>
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
      <div className="crud-actions">
        <DynamicButton
          type="save" // Cambiado a un tipo válido
          onClick={() => navigate('/factura/nueva')}
          label="Crear Factura"
        />
      </div>
    </div>
  );
};

export default InvoicesCRUD;
