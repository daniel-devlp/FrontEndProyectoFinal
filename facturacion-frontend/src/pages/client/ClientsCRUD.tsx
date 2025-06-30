import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { useClients, validateClientFields, validateClientFieldsUpdate } from '../../hooks/useClients';
import type { ClientDto } from '../../@types/clients';
import '../../assets/styles/ClientsCRUD.css';
import Modal from '../../components/common/Modal';
import DynamicButton from '../../components/common/DynamicButton';
import { notifications, confirmAction, confirmDestructiveAction, confirmUpdateAction, withLoadingToast } from '../../utils/notifications';
import SearchBar from '../../components/common/SearchBar';

const ClientsCRUD = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const { clients, totalItems, loading, searching, error, createClient, updateClient, deleteClient } = useClients({
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

    // Confirmación antes de crear
    const confirmed = await confirmAction(
      '¿Estás seguro de que deseas crear este cliente?',
      'Confirmar Creación de Cliente'
    );
    if (!confirmed) return;

    const clientToAdd = {
      ...selectedClient,
      identificationType: selectedClient.identificationType || 'cedula',
    };

    const errors = validateClientFields(clientToAdd, clients);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      notifications.error('Error en los datos del cliente. Por favor, revise los campos marcados en rojo.');
      return;
    }

    try {
      await withLoadingToast(
        () => createClient(clientToAdd),
        'Creando cliente...',
        'Cliente creado exitosamente',
        undefined,
        false // No mostrar error toast desde withLoadingToast
      );
      // Solo cerrar el modal si la creación fue exitosa
      handleModalClose();
    } catch (error) {
      // Extraer mensaje específico del error del backend
      let errorMessage = 'Error al crear cliente. Por favor, intente nuevamente.';
      
      // Manejar errores de axios (respuestas HTTP)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        
        if (axiosError.response?.data) {
          // Intentar extraer el mensaje del backend
          if (typeof axiosError.response.data === 'string') {
            errorMessage = axiosError.response.data;
          } else if (axiosError.response.data.message) {
            errorMessage = axiosError.response.data.message;
          } else if (axiosError.response.data.error) {
            errorMessage = axiosError.response.data.error;
          } else if (axiosError.response.data.title) {
            errorMessage = axiosError.response.data.title;
          }
        }
        
        // Mensajes específicos por código de estado HTTP
        if (!axiosError.response?.data || errorMessage === 'Error al crear cliente. Por favor, intente nuevamente.') {
          switch (axiosError.response?.status) {
            case 400:
              errorMessage = 'Datos inválidos. Verifique la información e intente nuevamente.';
              break;
            case 409:
              errorMessage = 'Ya existe un cliente con esta cédula o correo electrónico.';
              break;
            case 500:
              errorMessage = 'Error interno del servidor. Por favor, contacte al administrador.';
              break;
            case 422:
              errorMessage = 'Los datos proporcionados no cumplen con los requisitos del sistema.';
              break;
            default:
              errorMessage = `Error del servidor (${axiosError.response?.status}). Intente nuevamente.`;
          }
        }
      } 
      // Manejar errores de JavaScript/validación
      else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      notifications.error(errorMessage);
      // NO cerrar el modal en caso de error para que el usuario pueda corregir
    }
  };
  // Asegurar que el evento onSubmit no se propague más allá del formulario
  const handleEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Detener el comportamiento predeterminado del formulario

    if (!selectedClient) return;

    // Confirmación antes de actualizar
    const confirmed = await confirmUpdateAction(
      '¿Estás seguro de que deseas actualizar este cliente?',
      'Confirmar Actualización de Cliente'
    );
    if (!confirmed) return;

    // Asegurar que identificationType tenga un valor predeterminado directamente
    const clientToUpdate = {
      ...selectedClient,
      identificationType: selectedClient.identificationType || 'cedula',
    };

    const errors = validateClientFieldsUpdate(clientToUpdate, clients);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      notifications.error('Error en los datos del cliente. Por favor, revise los campos marcados en rojo.');
      return;
    }

    try {
      await withLoadingToast(
        () => updateClient(clientToUpdate.clientId, clientToUpdate),
        'Actualizando cliente...',
        'Cliente actualizado exitosamente'
      );
      handleModalClose(); // Cerrar el modal automáticamente
    } catch (error) {
      notifications.error('Error al actualizar cliente. Por favor, intente nuevamente.');
    }
  };

  const handleDelete = async (clientId: number) => {
    const client = clients.find(c => c.clientId === clientId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : 'este cliente';
    
    const confirmed = await confirmDestructiveAction(
      `¿Estás seguro de que deseas eliminar ${clientName}? Esta acción no se puede deshacer.`,
      'Confirmar Eliminación de Cliente',
      'Sí, eliminar cliente'
    );
    
    if (confirmed) {
      try {
        await withLoadingToast(
          () => deleteClient(clientId),
          'Eliminando cliente...',
          'Cliente eliminado exitosamente'
        );
      } catch (error) {
        notifications.error('Error al eliminar cliente. Por favor, intente nuevamente.');
        console.error('Error al eliminar cliente:', error);
      }
    }
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
      <div className="crud-dashboard">        <h1>Gestión de Clientes</h1>
        <p>Total de clientes: {totalItems}</p>
        {loading && clients.length === 0 && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}        <div className="search-bar">
          <SearchBar
            placeholder="Buscar clientes..."
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
          <div className="table-container">
          <div className="clients-table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  
                  <th>Número de Identificación</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.clientId}>
                    
                    <td className="text-left">{client.identificationNumber}</td>
                    <td className="text-left">{client.firstName}</td>
                    <td className="text-left">{client.lastName}</td>
                    <td className="text-left">{client.email}</td>
                    <td className="text-left">{client.phone}</td>
                    <td className="text-left">{client.address}</td>
                    <td className="text-left">
                      <div className="actions-cell">
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



