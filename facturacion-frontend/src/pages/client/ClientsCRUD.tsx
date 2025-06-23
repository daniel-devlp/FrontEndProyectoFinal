import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { useClients, validateClientFields, validateClientFieldsUpdate } from '../../hooks/useClients';
import type { ClientDto } from '../../@types/clients';
import '../../assets/styles/ClientsCRUD.css';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import DynamicButton from '../../components/common/DynamicButton';
import { toast } from 'react-toastify';
import SearchBar from '../../components/common/SearchBar';

const ClientsCRUD = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const { clients, totalItems, loading, error, createClient, updateClient, deleteClient } = useClients({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    searchTerm,
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'add' | 'update' | 'delete' | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  

  const handleAdd = async () => {
    if (!selectedClient) return;

    const clientToAdd = {
      ...selectedClient,
      identificationType: selectedClient.identificationType || 'cedula',
    };

    const errors = validateClientFields(clientToAdd, clients);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Error en los datos del cliente. Por favor, revise los campos marcados en rojo.');
      return;
    }

    try {
      await createClient(clientToAdd);
      toast.success('Cliente creado exitosamente.');
      handleModalClose(); // Cerrar el modal automáticamente
    } catch (error) {
      toast.error('Error al crear cliente. Por favor, intente nuevamente.');
    }
  };

  // Asegurar que el evento onSubmit no se propague más allá del formulario
  const handleEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Detener el comportamiento predeterminado del formulario

    if (!selectedClient) return;

    // Asegurar que identificationType tenga un valor predeterminado directamente
    const clientToUpdate = {
      ...selectedClient,
      identificationType: selectedClient.identificationType || 'cedula',
    };

    const errors = validateClientFieldsUpdate(clientToUpdate, clients);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Error en los datos del cliente. Por favor, revise los campos marcados en rojo.');
      return;
    }

    try {
      await updateClient(clientToUpdate.clientId, clientToUpdate);
      toast.success('Cliente actualizado exitosamente.');
      handleModalClose(); // Cerrar el modal automáticamente
    } catch (error) {
      toast.error('Error al actualizar cliente. Por favor, intente nuevamente.');
    }
  };

  const handleDelete = async (clientId: number) => {
    toast.warn(
      <div>
        <p>¿Estás seguro de que deseas eliminar este cliente?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button
            style={{ backgroundColor: '#ef4444', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            onClick={async () => {
              try {
                await deleteClient(clientId);
                toast.dismiss(); // Cerrar la notificación
                toast.success('Cliente eliminado exitosamente.');
              } catch (error) {
                toast.error('Error al eliminar cliente. Por favor, intente nuevamente.');
              }
            }}
          >
            Sí
          </button>
          <button
            style={{ backgroundColor: '#64748b', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => toast.dismiss()}
          >
            No
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: 'top-center',
      }
    );
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalContent(null);
    setSelectedClient(null);
    setFormErrors({}); // Limpiar errores al cerrar el modal
  };

  const handleOpenModal = (type: 'add' | 'update', client?: ClientDto) => {
    setModalContent(type);
    if (type === 'update' && client) {
      setSelectedClient(client);
    } else {
      setSelectedClient({
        clientId: 0,
        identificationType: 'cedula', // Valor predeterminado
        identificationNumber: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
      });
    }
    setModalOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search term changes
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setSelectedClient((prev) => ({ ...prev!, [fieldName]: value }));

    // Validar solo el campo que se está editando
    const fieldError = validateClientFields({ [fieldName]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, [fieldName]: fieldError[fieldName] }));
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="clients-crud">
      <Navbar />
      <div className="crud-dashboard">
        <h1>Gestión de Clientes</h1>
        <p>Total de clientes: {totalItems}</p>
        {loading && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}
        <SearchBar
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Table
          columns={[
            { key: 'identificationNumber', header: 'Número de Identificación' },
            { key: 'fullName', header: 'Nombre' },
            { key: 'email', header: 'Correo Electrónico' },
            { key: 'phone', header: 'Teléfono' },
            { key: 'address', header: 'Dirección' },
          ]}
          data={clients.map((client) => ({
            ...client,
            fullName: `${client.firstName} ${client.lastName}`,
          }))}
          renderActions={(client) => (
            <>
              <DynamicButton
                type="edit"
                onClick={() => handleOpenModal('update', client)}
                label="Editar"
              />
              <DynamicButton
                type="delete"
                onClick={() => handleDelete(client.clientId)}
                label="Eliminar"
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
            type="save"
            onClick={() => handleOpenModal('add')}
            label="Agregar Cliente"
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={modalContent === 'add' ? 'Agregar Cliente' : 'Editar Cliente'}
          onSubmit={modalContent === 'add' ? handleAdd : handleEdit}
          submitText={modalContent === 'add' ? 'Agregar' : 'Guardar'}
          cancelText="Cancelar"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (modalContent === 'add') {
                handleAdd();
              } else if (modalContent === 'update') {
                handleEdit();
              }
            }}
          >
            <div className="form-field">
              <label>Tipo de Identificación:</label>
              <input type="text" value="cedula" disabled />
            </div>
            <div className="form-field">
              <label>Número de Identificación:</label>
              <input
                type="text"
                value={selectedClient?.identificationNumber || ''}
                onChange={(e) => handleFieldChange('identificationNumber', e.target.value)}
                className={formErrors.identificationNumber ? 'error' : ''}
                maxLength={10}
                pattern="\d*"
              />
              {formErrors.identificationNumber && <p className="error-message">{formErrors.identificationNumber}</p>}
            </div>
            <div className="form-field">
              <label>Nombre:</label>
              <input
                type="text"
                value={selectedClient?.firstName || ''}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                className={formErrors.firstName ? 'error' : ''}
                maxLength={50}
                pattern="[A-Za-záéíóúÁÉÍÓÚñÑ ]*"
              />
              {formErrors.firstName && <p className="error-message">{formErrors.firstName}</p>}
            </div>
            <div className="form-field">
              <label>Apellido:</label>
              <input
                type="text"
                value={selectedClient?.lastName || ''}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                className={formErrors.lastName ? 'error' : ''}
                maxLength={50}
                pattern="[A-Za-záéíóúÁÉÍÓÚñÑ ]*"
              />
              {formErrors.lastName && <p className="error-message">{formErrors.lastName}</p>}
            </div>
            <div className="form-field">
              <label>Teléfono:</label>
              <input
                type="text"
                value={selectedClient?.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={formErrors.phone ? 'error' : ''}
                maxLength={10}
                pattern="\d*"
              />
              {formErrors.phone && <p className="error-message">{formErrors.phone}</p>}
            </div>
            <div className="form-field">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                value={selectedClient?.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && <p className="error-message">{formErrors.email}</p>}
            </div>
            <div className="form-field">
              <label>Dirección:</label>
              <input
                type="text"
                value={selectedClient?.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                className={formErrors.address ? 'error' : ''}
                maxLength={100}
              />
              {formErrors.address && <p className="error-message">{formErrors.address}</p>}
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ClientsCRUD;
