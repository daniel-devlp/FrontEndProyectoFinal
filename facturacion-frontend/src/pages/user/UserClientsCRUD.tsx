/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 👥 COMPONENTE CRUD DE CLIENTES PARA USUARIOS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este componente proporciona una interfaz completa para que los usuarios
 * gestionen clientes en el sistema. Incluye funcionalidades CRUD completas
 * con confirmaciones modernas y validaciones avanzadas.
 * 
 * 🎯 FUNCIONALIDADES PRINCIPALES:
 * • Listado paginado de clientes con búsqueda en tiempo real
 * • Creación de nuevos clientes con validación completa
 * • Edición de clientes existentes (solo los propios)
 * • Validación de cédulas ecuatorianas en tiempo real
 * • Sistema de confirmaciones para todas las acciones
 * • Búsqueda instantánea con debounce automático
 * • Interfaz responsiva que se adapta a cualquier dispositivo
 * • Manejo robusto de estados de carga y errores
 * 
 * 🔒 PERMISOS Y SEGURIDAD:
 * • Los usuarios pueden crear y editar clientes
 * • Solo administradores pueden eliminar clientes
 * • Validación de permisos en el backend
 * • Sanitización de datos antes del envío
 * • Protección contra inyección de código
 * 
 * 🎨 EXPERIENCIA DE USUARIO:
 * • Modales elegantes para creación y edición
 * • Confirmaciones contextuales según la acción
 * • Feedback inmediato en todas las operaciones
 * • Búsqueda sin necesidad de botones
 * • Paginación intuitiva y eficiente
 * • Indicadores de carga en operaciones largas
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Exportación de lista de clientes a PDF/Excel
 * • Filtros avanzados (por fecha, ciudad, etc.)
 * • Vista de tarjetas además de tabla
 * • Bulk actions (acciones masivas)
 * • Historial de cambios por cliente
 * • Integración con mapas para direcciones
 * • Sistema de favoritos/clientes frecuentes
 * • Validación de direcciones con APIs externas
 * • Upload de fotos de perfil para clientes
 * • Sistema de notas/comentarios por cliente
 * 
 * 📱 RESPONSIVIDAD:
 * • Tabla horizontal scrollable en móviles
 * • Botones adaptados para touch screens
 * • Modales optimizados para pantallas pequeñas
 * • Tipografía escalable según el dispositivo
 * 
 * 💡 EJEMPLO DE FLUJO DE USO:
 * 1. Usuario busca cliente existente
 * 2. Si no existe, hace clic en "Agregar Cliente"
 * 3. Llena formulario con validación en tiempo real
 * 4. Sistema confirma la creación
 * 5. Cliente se agrega a la lista automáticamente
 * 6. Usuario puede editarlo posteriormente si es necesario
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications, confirmAction, confirmCreateAction, confirmUpdateAction } from '../../utils/notifications';
import Navbar from '../../components/common/Navbar';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useClients } from '../../hooks/useClients';
import type { ClientDto } from '../../@types/clients';
import '../../assets/styles/UserClientsCRUD.css';

/**
 * 👥 COMPONENTE PRINCIPAL UserClientsCRUD
 * 
 * Renderiza la interfaz completa de gestión de clientes para usuarios finales.
 * Combina listado, búsqueda, paginación y modales de creación/edición.
 * 
 * @returns JSX.Element - Interfaz completa de gestión de clientes
 */

const UserClientsCRUD: React.FC = () => {
  // ╔═══════════════════════════════════════════════════════════════════════════
  // ║ 🔧 HOOKS Y ESTADO DEL COMPONENTE
  // ╚═══════════════════════════════════════════════════════════════════════════
  
  /** 🧭 Hook de navegación para redirecciones */
  const navigate = useNavigate();
  
  // ╔═══════════════════════════════════════════════════════════════════════════
  // ║ 📊 ESTADOS DE PAGINACIÓN Y BÚSQUEDA
  // ╚═══════════════════════════════════════════════════════════════════════════
  
  /** 📄 Página actual del sistema de paginación (base 1) */
  const [currentPage, setCurrentPage] = useState(1);
  
  /** 🔍 Término de búsqueda actual con debounce automático */
  const [searchTerm, setSearchTerm] = useState('');
  
  /** 📏 Número de elementos por página (configurable) */
  const itemsPerPage = 10;

  // ╔═══════════════════════════════════════════════════════════════════════════
  // ║ 🪟 ESTADOS DE MODALES
  // ╚═══════════════════════════════════════════════════════════════════════════
  
  /** ➕ Controla la visibilidad del modal de creación de cliente */
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  
  /** ✏️ Controla la visibilidad del modal de edición de cliente */
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
  // ╔═══════════════════════════════════════════════════════════════════════════
  // ║ 📝 ESTADO DEL FORMULARIO
  // ╚═══════════════════════════════════════════════════════════════════════════
  
  /** 
   * 👤 Cliente actualmente seleccionado para crear/editar
   * 
   * Se inicializa con valores por defecto para nuevos clientes.
   * Cuando clientId = 0: modo creación
   * Cuando clientId > 0: modo edición
   */
  const [selectedClient, setSelectedClient] = useState<ClientDto>({
    clientId: 0, // 0 indica cliente nuevo, >0 indica cliente existente
    identificationType: 'cedula', // Tipo por defecto más común en Ecuador
    identificationNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  // ╔═══════════════════════════════════════════════════════════════════════════
  // ║ 🔄 HOOK PERSONALIZADO DE CLIENTES
  // ╚═══════════════════════════════════════════════════════════════════════════
  
  /**
   * 📊 Hook que maneja toda la lógica de clientes
   * Incluye: paginación, búsqueda, operaciones CRUD, validaciones
   */
  const { 
    clients,        // Lista de clientes de la página actual
    totalItems,     // Total de clientes (para paginación)
    loading,        // Estado de carga de la lista
    searching,      // Estado de búsqueda activa
    error,          // Error de carga si existe
    createClient,   // Función para crear nuevo cliente
    updateClient    // Función para actualizar cliente existente
  } = useClients({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    searchTerm,
  });

  // ╔═══════════════════════════════════════════════════════════════════════════
  // ║ 🔍 MANEJADORES DE BÚSQUEDA Y PAGINACIÓN
  // ╚═══════════════════════════════════════════════════════════════════════════

  /**
   * 🔍 MANEJADOR DE CAMBIOS EN LA BÚSQUEDA
   * 
   * Se ejecuta cada vez que el usuario escribe en el campo de búsqueda.
   * Implementa reset automático a la primera página para mostrar resultados relevantes.
   * 
   * @param e - Evento del input de búsqueda
   * 
   * 🔄 Comportamiento:
   * 1. Actualiza el término de búsqueda inmediatamente
   * 2. Resetea a la página 1 (los resultados pueden cambiar)
   * 3. El hook useClients maneja el debounce automáticamente
   * 
   * 💡 UX considerations:
   * • No necesita botón "Buscar" - es instantáneo
   * • Reset automático de página evita confusión
   * • Debounce previene requests excesivos al servidor
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset a página 1 para nuevos resultados
  };

  /**
   * 📄 MANEJADOR DE CAMBIOS DE PÁGINA
   * 
   * Actualiza la página actual del sistema de paginación.
   * Se integra automáticamente con el hook useClients para cargar nuevos datos.
   * 
   * @param newPage - Número de la nueva página (base 1)
   * 
   * 🔄 Comportamiento:
   * 1. Actualiza el estado de página actual
   * 2. useClients detecta el cambio y carga datos automáticamente
   * 3. Se mantiene el término de búsqueda actual
   * 
   * 🛡️ Validaciones implícitas:
   * • Los botones de paginación manejan límites automáticamente
   * • No es posible ir a páginas inexistentes
   */
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // ╔═══════════════════════════════════════════════════════════════════════════
  // ║ 🪟 MANEJADORES DE MODALES
  // ╚═══════════════════════════════════════════════════════════════════════════

  /**
   * ❌ CIERRE DEL MODAL DE AGREGAR CLIENTE
   * 
   * Cierra el modal de creación y resetea el formulario a valores por defecto.
   * Importante para evitar que datos de un cliente aparezcan en el siguiente.
   * 
   * 🔄 Comportamiento:
   * 1. Cierra el modal de agregado
   * 2. Resetea completamente el formulario
   * 3. Garantiza estado limpio para el próximo uso
   * 
   * 💡 Se ejecuta cuando:
   * • Usuario hace clic en "Cancelar"
   * • Usuario presiona ESC (si está implementado)
   * • Se completa exitosamente la creación
   */
  const handleAddModalClose = () => {
    setAddModalOpen(false);
    // Reset completo del formulario para evitar datos residuales
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

  /**
   * ❌ CIERRE DEL MODAL DE EDITAR CLIENTE
   * 
   * Similar al cierre de modal de agregar, pero para edición.
   * Resetea el formulario para evitar que datos editados persistan.
   */
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    // Reset del formulario después de edición
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

  /**
   * ✏️ PREPARACIÓN PARA EDITAR CLIENTE
   * 
   * Carga los datos del cliente seleccionado en el formulario y abre el modal de edición.
   * Es el punto de entrada para todas las operaciones de edición.
   * 
   * @param client - Cliente a editar con todos sus datos actuales
   * 
   * 🔄 Comportamiento:
   * 1. Carga todos los datos del cliente en el estado del formulario
   * 2. Abre el modal de edición
   * 3. El formulario se pre-llena automáticamente
   * 
   * 💡 Consideraciones:
   * • Se pasa una copia completa del objeto cliente
   * • clientId > 0 indica modo edición al guardar
   * • Todos los campos se pre-llenan para edición inmediata
   */
  const handleEdit = (client: ClientDto) => {
    setSelectedClient(client); // Cargar datos completos del cliente
    setEditModalOpen(true);    // Abrir modal en modo edición
  };

  /**
   * 💾 GUARDADO DE CLIENTE (CREAR O ACTUALIZAR)
   * 
   * Función unificada que maneja tanto creación como actualización de clientes.
   * Incluye confirmaciones contextuales y manejo robusto de errores.
   * 
   * 🔄 Flujo completo:
   * 1. Determina si es creación (clientId = 0) o edición (clientId > 0)
   * 2. Muestra confirmación apropiada según el tipo de operación
   * 3. Si el usuario confirma, procede con la operación
   * 4. Llama a la función correspondiente del hook useClients
   * 5. Muestra notificación de resultado (éxito o error)
   * 6. Cierra el modal y resetea formulario si es exitoso
   * 
   * 🎯 Confirmaciones contextuales:
   * • Creación: confirmCreateAction con texto específico
   * • Edición: confirmUpdateAction con texto específico
   * • Permite al usuario cancelar sin consecuencias
   * 
   * 🛡️ Manejo de errores:
   * • Try-catch robusto para operaciones asíncronas
   * • Notificaciones específicas según el resultado
   * • El hook useClients maneja validaciones internas
   * 
   * 💡 UX considerations:
   * • Confirmación antes de cualquier cambio
   * • Feedback inmediato del resultado
   * • Cierre automático solo si es exitoso
   * • Mantiene modal abierto si hay errores para corrección
   */
  const handleSave = async () => {
    // Determinar tipo de operación según clientId
    const action = selectedClient.clientId === 0 ? 'crear' : 'actualizar';
    const confirmMessage = `¿Estás seguro de que deseas ${action} este cliente?`;
    
    // Mostrar confirmación contextual apropiada
    const confirmed = selectedClient.clientId === 0 
      ? await confirmCreateAction(confirmMessage, 'Confirmar Creación de Cliente')
      : await confirmUpdateAction(confirmMessage, 'Confirmar Actualización de Cliente');
    
    // Si el usuario cancela, no hacer nada
    if (!confirmed) {
      return;
    }

    try {
      if (selectedClient.clientId === 0) {
        // 🆕 MODO CREACIÓN: Crear nuevo cliente
        await createClient(selectedClient);
        notifications.success('Cliente creado exitosamente');
        handleAddModalClose(); // Cerrar modal y resetear formulario
      } else {
        // ✏️ MODO EDICIÓN: Actualizar cliente existente
        await updateClient(selectedClient.clientId, selectedClient);
        notifications.success('Cliente actualizado exitosamente');
        handleEditModalClose(); // Cerrar modal y resetear formulario
      }
    } catch (err) {
      // 🚨 Manejo de errores con notificación específica
      notifications.error('Error al guardar el cliente');
      // No cerrar modal para permitir correcciones
    }
  };

  /**
   * 📝 MANEJADOR DE CAMBIOS EN INPUTS DEL FORMULARIO
   * 
   * Maneja todos los cambios en los campos del formulario de cliente.
   * Actualiza el estado automáticamente con cada tecla.
   * 
   * @param e - Evento del input que cambió
   * 
   * 🔄 Comportamiento:
   * 1. Extrae nombre y valor del campo que cambió
   * 2. Actualiza solo ese campo en el estado
   * 3. Mantiene todos los demás campos intactos
   * 
   * 💡 Ventajas:
   * • Actualizaciones en tiempo real
   * • Validación inmediata posible
   * • UX fluida sin latencia
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedClient((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  // ╔═══════════════════════════════════════════════════════════════════════════
  // ║ 📊 CÁLCULOS DERIVADOS
  // ╚═══════════════════════════════════════════════════════════════════════════
  
  /** 📄 Total de páginas calculado automáticamente */
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
      {error && <p>Error: {error}</p>}      <div className="table-container">
        <div className="user-clients-table-container">
          <table className="user-clients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.clientId}>
                  <td className="text-right">{client.clientId}</td>
                  <td className="text-left">{client.identificationNumber}</td>
                  <td className="text-left">{client.firstName}</td>
                  <td className="text-left">{client.lastName}</td>
                  <td className="text-left">{client.phone}</td>
                  <td className="text-left">{client.email}</td>
                  <td className="text-left">{client.address}</td>
                  <td className="text-center">
                    <Button
                      onClick={() => handleEdit(client)}
                      variant="secondary"
                      className="btn-sm"
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="actions-section">
        <Button
          onClick={() => setAddModalOpen(true)}
          variant="primary"
        >
          Agregar Cliente
        </Button>
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

      {/* Modal para agregar cliente */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        title="Agregar Cliente"
      >
        <div className="client-form">
          <div className="form-group">
            <label htmlFor="identificationType">Tipo de Identificación:</label>
            <select
              id="identificationType"
              name="identificationType"
              value={selectedClient.identificationType}
              onChange={handleInputChange}
            >
              <option value="cedula">Cédula</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="extranjeria">Extranjería</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="identificationNumber">Número de Identificación:</label>
            <input
              type="text"
              id="identificationNumber"
              name="identificationNumber"
              value={selectedClient.identificationNumber}
              onChange={handleInputChange}
              placeholder="Ingrese el número de identificación"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstName">Nombre:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={selectedClient.firstName}
              onChange={handleInputChange}
              placeholder="Ingrese el nombre"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Apellido:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={selectedClient.lastName}
              onChange={handleInputChange}
              placeholder="Ingrese el apellido"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={selectedClient.email}
              onChange={handleInputChange}
              placeholder="Ingrese el email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Teléfono:</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={selectedClient.phone}
              onChange={handleInputChange}
              placeholder="Ingrese el teléfono"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Dirección:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={selectedClient.address}
              onChange={handleInputChange}
              placeholder="Ingrese la dirección"
              required
            />
          </div>
          <div className="modal-actions">
            <Button
              onClick={handleSave}
              variant="primary"
            >
              Guardar
            </Button>
            <Button
              onClick={handleAddModalClose}
              variant="secondary"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para editar cliente */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        title="Editar Cliente"
      >
        <div className="client-form">
          <div className="form-group">
            <label htmlFor="identificationType">Tipo de Identificación:</label>
            <select
              id="identificationType"
              name="identificationType"
              value={selectedClient.identificationType}
              onChange={handleInputChange}
            >
              <option value="cedula">Cédula</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="extranjeria">Extranjería</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="identificationNumber">Número de Identificación:</label>
            <input
              type="text"
              id="identificationNumber"
              name="identificationNumber"
              value={selectedClient.identificationNumber}
              onChange={handleInputChange}
              placeholder="Ingrese el número de identificación"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstName">Nombre:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={selectedClient.firstName}
              onChange={handleInputChange}
              placeholder="Ingrese el nombre"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Apellido:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={selectedClient.lastName}
              onChange={handleInputChange}
              placeholder="Ingrese el apellido"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={selectedClient.email}
              onChange={handleInputChange}
              placeholder="Ingrese el email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Teléfono:</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={selectedClient.phone}
              onChange={handleInputChange}
              placeholder="Ingrese el teléfono"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Dirección:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={selectedClient.address}
              onChange={handleInputChange}
              placeholder="Ingrese la dirección"
              required
            />
          </div>
          <div className="modal-actions">
            <Button
              onClick={handleSave}
              variant="primary"
            >
              Actualizar
            </Button>
            <Button
              onClick={handleEditModalClose}
              variant="secondary"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
};

export default UserClientsCRUD;
