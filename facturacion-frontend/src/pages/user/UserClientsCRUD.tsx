import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import DynamicButton from '../../components/common/DynamicButton';
import { toast } from 'react-toastify';
import { useClients } from '../../hooks/useClients';
import type { ClientDto } from '../../@types/clients';
import '../../assets/styles/UserClientsCRUD.css';

const UserClientsCRUD: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDto>({
    clientId: 0,
    identificationType: 'cedula',
    identificationNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });
  const itemsPerPage = 10;

  const { clients, totalItems, loading, searching, error, createClient, updateClient } = useClients({
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

  const handleAddModalClose = () => {
    setAddModalOpen(false);
    setSelectedClient({
      clientId: 0,
      identificationType: 'cedula',
      identificationNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedClient({
      clientId: 0,
      identificationType: 'cedula',
      identificationNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleEdit = (client: ClientDto) => {
    setSelectedClient(client);
    setEditModalOpen(true);
  };
  const handleSave = async () => {
    try {
      if (selectedClient.clientId === 0) {
        await createClient(selectedClient);
        toast.success('Cliente creado exitosamente');
        handleAddModalClose();
      } else {
        await updateClient(selectedClient.clientId, selectedClient);
        toast.success('Cliente actualizado exitosamente');
        handleEditModalClose();
      }
    } catch (err) {
      toast.error('Error al guardar el cliente');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedClient((prev) => ({ ...prev, [name]: value }));
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return (
    <div className="user-clients-crud">
      <Navbar />
      <div className="user-clients-dashboard">
        <h1>Gestión de Clientes</h1>
        <p style={{ 
          color: '#7f8c8d', 
          marginBottom: '2rem',
          fontSize: '1.1rem',
          fontStyle: 'italic'
        }}>
          Panel de usuario - Crear, editar y consultar clientes
        </p>
      <div className="search-bar">
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
      {loading && clients.length === 0 && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      <Table
        columns={[
          { key: 'identificationNumber', header: 'Cédula' },
          { key: 'firstName', header: 'Nombre' },
          { key: 'lastName', header: 'Apellido' },
          { key: 'phone', header: 'Teléfono' },
          { key: 'email', header: 'Email' },
        ]}
        data={clients}
        renderActions={(client) => (
          <DynamicButton
            type="edit"
            onClick={() => handleEdit(client)}
            label="Editar"
          />
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
          onClick={() => setAddModalOpen(true)}
          label="Agregar Cliente"
        />
      </div>

      {/* Modal para agregar/editar cliente */}
      <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={isEditModalOpen ? handleEditModalClose : handleAddModalClose}>
        <h2>{selectedClient.clientId === 0 ? 'Agregar Cliente' : 'Editar Cliente'}</h2>
        <form>
          <div>
            <label htmlFor="identificationType">Tipo de Identificación:</label>
            <select
              id="identificationType"
              name="identificationType"
              value={selectedClient.identificationType}
              onChange={handleInputChange}
            >
              <option value="cedula">Cédula</option>
            </select>
          </div>
          <div>
            <label htmlFor="identificationNumber">Número de Identificación:</label>
            <input
              type="text"
              id="identificationNumber"
              name="identificationNumber"
              value={selectedClient.identificationNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="firstName">Nombre:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={selectedClient.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName">Apellido:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={selectedClient.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={selectedClient.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="phone">Teléfono:</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={selectedClient.phone}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="address">Dirección:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={selectedClient.address}
              onChange={handleInputChange}
            />
          </div>
          <div className="modal-actions">
            <DynamicButton
              type="save"
              onClick={handleSave}
              label="Guardar"
            />
            <DynamicButton
              type="delete"
              onClick={isEditModalOpen ? handleEditModalClose : handleAddModalClose}
              label="Cancelar"
            />
          </div>        </form>
      </Modal>
      </div>
    </div>
  );
};

export default UserClientsCRUD;
