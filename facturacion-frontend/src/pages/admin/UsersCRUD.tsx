import { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { useUsers } from '../../hooks/useUsers';
import type { UserDto } from '../../@types/users';
import '../../assets/styles/UsersCRUD.css';
import Modal from '../../components/common/Modal';
import DynamicButton from '../../components/common/DynamicButton';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import { notifications, confirmAction, confirmDestructiveAction, confirmUpdateAction, withLoadingToast } from '../../utils/notifications';
import { 
  validateUserForCreation, 
  validateUserForUpdate, 
  formatCedulaInput, 
  formatUserNameInput, 
  formatNameInput, 
  formatEmailInput 
} from '../../utils/userValidations';

const UsersCRUD = () => {
  const { users, createUser, updateUser, deleteUser, unlockUser, loading, error } = useUsers();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto>({
    id: '',
    identificationNumber: '',
    userName: '',
    name: '',
    email: '',
    emailConfirmed: false,
    roles: [],
    isLocked: false,
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * 🔧 Funciones para manejo de modales
   */
  const handleAddModalClose = () => {
    setAddModalOpen(false);
    setSelectedUser({
      id: '',
      identificationNumber: '',
      userName: '',
      name: '',
      email: '',
      emailConfirmed: false,
      roles: [],
      isLocked: false,
      password: '',
    });
    setFieldErrors({});
    setConfirmPassword('');
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedUser({
      id: '',
      userName: '',
      name: '',
      email: '',
      emailConfirmed: false,
      roles: [],
      isLocked: false,
      password: '',
      identificationNumber: '',
    });
    setFieldErrors({});
    setConfirmPassword('');
  };
  /**
   * 🔄 Manejador de cambios en campos del formulario
   * 
   * Aplica formateo específico según el tipo de campo y valida en tiempo real.
   * Utiliza limitadores de entrada para prevenir datos incorrectos.
   */
  const handleFieldChange = (field: string, value: string) => {
    let formattedValue = value;

    // Aplicar formateo específico según el campo
    switch (field) {
      case 'identificationNumber':
        formattedValue = formatCedulaInput(value);
        break;
      case 'userName':
        formattedValue = formatUserNameInput(value);
        break;
      case 'name':
        formattedValue = formatNameInput(value);
        break;
      case 'email':
        formattedValue = formatEmailInput(value);
        break;
      default:
        formattedValue = value;
    }

    setSelectedUser((prev) => ({ ...prev, [field]: formattedValue }));

    // Validar el campo en tiempo real usando la función específica
    if (isEditModalOpen) {
      // Para edición, crear objeto con formato de actualización
      const updateData = {
        id: selectedUser.id,
        identificationNumber: field === 'identificationNumber' ? formattedValue : selectedUser.identificationNumber || '',
        userName: field === 'userName' ? formattedValue : selectedUser.userName,
        email: field === 'email' ? formattedValue : selectedUser.email,
        emailConfirmed: selectedUser.emailConfirmed,
        roles: selectedUser.roles,
        isLocked: selectedUser.isLocked
      };
      
      const errors = validateUserForUpdate(updateData, users);
      
      // Actualizar solo el error del campo específico
      setFieldErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (errors[field]) {
          newErrors[field] = errors[field];
        } else {
          delete newErrors[field]; // Eliminar el error si el campo es válido
        }
        return newErrors;
      });
    } else {
      // Para crear usuario, usar la validación de creación
      const createData = {
        identificationNumber: field === 'identificationNumber' ? formattedValue : selectedUser.identificationNumber || '',
        userName: field === 'userName' ? formattedValue : selectedUser.userName,
        name: field === 'name' ? formattedValue : selectedUser.name,
        email: field === 'email' ? formattedValue : selectedUser.email,
        password: field === 'password' ? formattedValue : selectedUser.password || '',
        roles: selectedUser.roles,
        confirmPassword: confirmPassword
      };
      
      const errors = validateUserForCreation(createData, users);
      
      // Actualizar solo el error del campo específico
      setFieldErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (errors[field]) {
          newErrors[field] = errors[field];
        } else {
          delete newErrors[field]; // Eliminar el error si el campo es válido
        }
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      confirmPassword: value !== selectedUser.password ? 'Las contraseñas no coinciden' : '',
    }));
  };  /**
   * ➕ Manejador para crear un nuevo usuario
   * 
   * Valida todos los campos requeridos y crea el usuario en el sistema.
   * Incluye confirmación de usuario y validaciones completas.
   */
  const handleAdd = async () => {
    // Confirmación antes de crear
    const confirmed = await confirmAction(
      '¿Estás seguro de que deseas crear este usuario?',
      'Confirmar Creación de Usuario'
    );
    if (!confirmed) return;

    // Preparar datos para validación de creación
    const createData = {
      identificationNumber: selectedUser.identificationNumber || '',
      userName: selectedUser.userName,
      name: selectedUser.name,
      email: selectedUser.email,
      password: selectedUser.password || '',
      roles: selectedUser.roles,
      confirmPassword: confirmPassword
    };

    // Validar datos antes de enviar
    const errors = validateUserForCreation(createData, users);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      notifications.error('Error en los datos del usuario. Por favor, revise los campos marcados.');
      return;
    }

    try {
      // Crear datos finales para el backend (sin confirmPassword)
      const userData = {
        identificationNumber: selectedUser.identificationNumber || '',
        userName: selectedUser.userName,
        name: selectedUser.name,
        email: selectedUser.email,
        password: selectedUser.password || '',
        roles: selectedUser.roles,
      };      
      
      await withLoadingToast(
        () => createUser(userData, errors),
        'Creando usuario...',
        'Usuario creado exitosamente'
      );
      handleAddModalClose();
      setFieldErrors({});
      setConfirmPassword('');
    } catch (error) {
      notifications.error('Error al crear usuario. Por favor, intente nuevamente.');
    }
  };  /**
   * ✏️ Manejador para editar un usuario existente
   * 
   * Valida los campos editables y actualiza el usuario en el sistema.
   * Utiliza validaciones específicas para actualización que omiten contraseña.
   */
  const handleEdit = async () => {
    // Confirmación antes de actualizar
    const confirmed = await confirmUpdateAction(
      '¿Estás seguro de que deseas actualizar este usuario?',
      'Confirmar Actualización de Usuario'
    );
    if (!confirmed) return;

    // Preparar datos según el formato esperado por el backend
    const updateData = {
      id: selectedUser.id,
      identificationNumber: selectedUser.identificationNumber || '',
      email: selectedUser.email,
      userName: selectedUser.userName,
      emailConfirmed: true, // 🔒 Campo quemado según política de negocio
      roles: selectedUser.roles,
      isLocked: selectedUser.isLocked
    };

    // Validaciones específicas para actualización
    const errors = validateUserForUpdate(updateData, users);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      notifications.error('Error en los datos del usuario. Por favor, revise los campos marcados.');
      return;
    }

    try {
      await withLoadingToast(
        () => updateUser(selectedUser.id, updateData, errors),
        'Actualizando usuario...',
        'Usuario actualizado exitosamente'
      );
      handleEditModalClose();
      setFieldErrors({});
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      notifications.error('Error al actualizar usuario. Por favor, intente nuevamente.');
    }
  };
  /**
   * 🗑️ Manejador para eliminar un usuario
   * 
   * Solicita confirmación y elimina el usuario del sistema de forma permanente.
   */  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    const userName = user ? user.name : 'este usuario';
    
    const confirmed = await confirmDestructiveAction(
      `¿Estás seguro de que deseas eliminar ${userName}? Esta acción no se puede deshacer.`,
      'Confirmar Eliminación de Usuario',
      'Sí, eliminar usuario'
    );
    
    if (confirmed) {
      try {
        await withLoadingToast(
          () => deleteUser(userId),
          'Eliminando usuario...',
          'Usuario eliminado exitosamente'
        );
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        notifications.error('Error al eliminar usuario');
      }
    }
  };

  const roleOptions = [
    { value: 'Administrator', label: 'Administrator' },
    { value: 'user', label: 'user' },
  ];

  return (
    <div className="users-crud">
      <Navbar />
      <div className="crud-dashboard">        <h1>Gestión de Usuarios</h1>
        {loading && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}        <div className="table-container">
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="text-left">{user.userName}</td>
                    <td className="text-left">{user.email}</td>
                    <td className="text-left">{user.roles.join(', ')}</td>
                    <td className="text-left">{user.isLocked ? 'Bloqueado' : 'Activo'}</td>
                    <td className="text-left">
                      <div className="actions-cell">                        <DynamicButton
                          type="edit"
                          onClick={() => {
                            // Cargar TODOS los datos del usuario en el modal de edición
                            setSelectedUser({
                              id: user.id,
                              identificationNumber: user.identificationNumber || '',
                              userName: user.userName,
                              name: user.name, // 🔧 CARGA COMPLETA: incluir nombre completo
                              email: user.email,
                              emailConfirmed: user.emailConfirmed, // 🔧 CARGA COMPLETA: estado actual
                              roles: [...user.roles], // 🔧 CARGA COMPLETA: crear copia del array
                              isLocked: user.isLocked, // 🔧 CARGA COMPLETA: estado de bloqueo
                              password: '' // Contraseña vacía para edición (no se muestra)
                            });
                            setFieldErrors({}); // Limpiar errores previos
                            setEditModalOpen(true);
                          }}
                          label="Editar"
                        />
                        <DynamicButton
                          type="delete"
                          onClick={() => handleDeleteUser(user.id)}
                          label="Eliminar"
                        />
                        {user.isLocked && (
                          <DynamicButton
                            type="save"
                            onClick={async () => {
                              const confirmed = await confirmAction(
                                '¿Estás seguro de que deseas desbloquear este usuario?',
                                'Confirmar Desbloqueo de Usuario'
                              );
                              if (confirmed) {
                                try {
                                  await withLoadingToast(
                                    () => unlockUser(user.id),
                                    'Desbloqueando usuario...',
                                    'Usuario desbloqueado exitosamente'
                                  );
                                  setSelectedUser((prev) => ({ ...prev, isLocked: false }));
                                } catch (error) {
                                  notifications.error('Error al desbloquear usuario');
                                }
                              }
                            }}
                            label="Desbloquear"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="crud-actions">
          <DynamicButton
            type="save"
            onClick={() => setAddModalOpen(true)}
            label="Agregar Usuario"
          />
        </div>

        <Modal
          isOpen={isAddModalOpen}
          onClose={handleAddModalClose}
          title="Agregar Usuario"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <div>
            <div className="form-field">
              <label>Número de Identificación:</label>
              <input
                type="text"
                maxLength={10}
                placeholder="Ingrese 10 dígitos"
                value={selectedUser.identificationNumber}
                onChange={(e) => handleFieldChange('identificationNumber', e.target.value)}
                className={fieldErrors.identificationNumber ? 'error' : ''}
              />
              {fieldErrors.identificationNumber && <p className="error-message">{fieldErrors.identificationNumber}</p>}
            </div>
            <div className="form-field">
              <label>Nombre de Usuario:</label>
              <input
                type="text"
                maxLength={50}
                placeholder="Mínimo 3 caracteres"
                value={selectedUser.userName}
                onChange={(e) => handleFieldChange('userName', e.target.value)}
                className={fieldErrors.userName ? 'error' : ''}
              />
              {fieldErrors.userName && <p className="error-message">{fieldErrors.userName}</p>}
            </div>
            <div className="form-field">
              <label>Nombre:</label>
              <input
                type="text"
                maxLength={100}
                placeholder="Nombre completo"
                value={selectedUser.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={fieldErrors.name ? 'error' : ''}
              />
              {fieldErrors.name && <p className="error-message">{fieldErrors.name}</p>}
            </div>
            <div className="form-field">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                maxLength={255}
                placeholder="ejemplo@correo.com"
                value={selectedUser.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={fieldErrors.email ? 'error' : ''}
              />
              {fieldErrors.email && <p className="error-message">{fieldErrors.email}</p>}
            </div>
            <div className="form-field">
              <label>Contraseña:</label>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={selectedUser.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={fieldErrors.password ? 'error' : ''}
                />
                <button type="button" onClick={togglePasswordVisibility}>
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {fieldErrors.password && <p className="error-message">{fieldErrors.password}</p>}
            </div>
            <div className="form-field">
              <label>Confirmar Contraseña:</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className={fieldErrors.confirmPassword ? 'error' : ''}
              />
              {fieldErrors.confirmPassword && <p className="error-message">{fieldErrors.confirmPassword}</p>}
            </div>
            <div className="form-field">
              <label>Roles:</label>
              <Select
                isMulti
                options={roleOptions}
                value={selectedUser.roles.map((role) => ({ value: role, label: role }))}
                onChange={(selectedOptions: MultiValue<{ value: string; label: string }>) => {
                  const rolesArray = selectedOptions.map((option) => option.value);
                  setSelectedUser((prev) => ({ ...prev, roles: rolesArray }));
                  // Validación en tiempo real para roles
                  if (rolesArray.length > 0 && fieldErrors.roles) {
                    setFieldErrors((prev) => ({ ...prev, roles: '' }));
                  } else if (rolesArray.length === 0) {
                    setFieldErrors((prev) => ({ ...prev, roles: 'Debe seleccionar al menos un rol' }));
                  }
                }}
                className={fieldErrors.roles ? 'error' : ''}
              />
              {fieldErrors.roles && <p className="error-message">{fieldErrors.roles}</p>}
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          title="Editar Usuario"
          onSubmit={(e) => {
            e.preventDefault();
            handleEdit();
          }}
        >
          <div>
            <div className="form-field">
              <label>Número de Identificación:</label>
              <input
                type="text"
                maxLength={10}
                placeholder="Ingrese 10 dígitos"
                value={selectedUser.identificationNumber}
                onChange={(e) => handleFieldChange('identificationNumber', e.target.value)}
                className={fieldErrors.identificationNumber ? 'error' : ''}
              />
              {fieldErrors.identificationNumber && <p className="error-message">{fieldErrors.identificationNumber}</p>}
            </div>
            <div className="form-field">
              <label>Nombre de Usuario:</label>
              <input
                type="text"
                maxLength={50}
                placeholder="Mínimo 3 caracteres"
                value={selectedUser.userName}
                onChange={(e) => handleFieldChange('userName', e.target.value)}
                className={fieldErrors.userName ? 'error' : ''}
              />
              {fieldErrors.userName && <p className="error-message">{fieldErrors.userName}</p>}
            </div>
            <div className="form-field">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                maxLength={255}
                placeholder="ejemplo@correo.com"
                value={selectedUser.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={fieldErrors.email ? 'error' : ''}
              />
              {fieldErrors.email && <p className="error-message">{fieldErrors.email}</p>}
            </div>
            <div className="form-field">
              <label>Roles:</label>
              <Select
                isMulti
                options={roleOptions}
                value={selectedUser.roles.map((role) => ({ value: role, label: role }))}
                onChange={(selectedOptions) => {
                  const rolesArray = selectedOptions.map((option) => option.value);
                  setSelectedUser((prev) => ({ ...prev, roles: rolesArray }));
                  // Validación en tiempo real para roles
                  if (rolesArray.length > 0 && fieldErrors.roles) {
                    setFieldErrors((prev) => ({ ...prev, roles: '' }));
                  } else if (rolesArray.length === 0) {
                    setFieldErrors((prev) => ({ ...prev, roles: 'Debe seleccionar al menos un rol' }));
                  }
                }}
                className={fieldErrors.roles ? 'error' : ''}
              />
              {fieldErrors.roles && <p className="error-message">{fieldErrors.roles}</p>}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default UsersCRUD;