import { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { useUsers } from '../../hooks/useUsers';
import type { UserDto } from '../../@types/users';
import '../../assets/styles/UsersCRUD.css';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import DynamicButton from '../../components/common/DynamicButton';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import { toast } from 'react-toastify';
import { validateUserFields } from '../../hooks/useUsers';

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

  const handleAddModalClose = () => {
    setAddModalOpen(false);
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
    });
  };

  const handleFieldChange = (field: string, value: string) => {
    setSelectedUser((prev) => ({ ...prev, [field]: value }));

    // Validar el campo en tiempo real
    const errors = validateUserFields({ ...selectedUser, [field]: value }, users);
    setFieldErrors((prevErrors) => ({ ...prevErrors, [field]: errors[field] || '' }));
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
  };

  const handleAdd = async () => {
    const errors = validateUserFields(selectedUser, users);
    if (Object.keys(errors).length > 0) {
      // setErrors(errors);
      toast.error('Error en los datos del usuario. Por favor, revise los campos marcados.');
      return;
    }

    try {
      const userData = {
        identificationNumber: selectedUser.identificationNumber || 'defaultId',
        userName: selectedUser.userName,
        name: selectedUser.name,
        email: selectedUser.email,
        password: selectedUser.password || 'defaultPassword',
        roles: selectedUser.roles.map((role) => role),
      };

      await createUser(userData);
      //toast.success('Usuario creado exitosamente.');
      handleAddModalClose();
    } catch (error) {
      toast.error('Error al crear usuario. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = async () => {
    const errors = validateUserFields(selectedUser, users);
    if (Object.keys(errors).length > 0) {
      // setErrors(errors);
      toast.error('Error en los datos del usuario. Por favor, revise los campos marcados.');
      return;
    }

    try {
      await updateUser(selectedUser.id, selectedUser);
      toast.success('Usuario actualizado exitosamente.');
      handleEditModalClose();
    } catch (error) {
      toast.error('Error al actualizar usuario. Por favor, intente nuevamente.');
    }
  };

  const handleDeleteUser = (userId: string) => {
    const ConfirmDeleteToast = ({ closeToast }: { closeToast: () => void }) => (
      <div>
        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
        <button
          onClick={() => {
            closeToast();
            toast.info(<FinalConfirmToast userId={userId} />, {
              autoClose: false,
              closeOnClick: false,
              draggable: false,
              position: 'top-center',
            });
          }}
        >
          Confirmar
        </button>
        <button onClick={closeToast}>Cancelar</button>
      </div>
    );

    const FinalConfirmToast = ({ userId }: { userId: string }) => (
      <div>
        <p>Confirma nuevamente para eliminar el usuario.</p>
        <button
          onClick={() => {
            deleteUser(userId);
            toast.dismiss();
           // toast.success('Usuario eliminado exitosamente.');
          }}
        >
          Confirmar
        </button>
        <button onClick={() => toast.dismiss()}>Cancelar</button>
      </div>
    );

    toast.info(<ConfirmDeleteToast closeToast={() => toast.dismiss()} />, {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      position: 'top-center',
    });
  };

  const roleOptions = [
    { value: 'Administrator', label: 'Administrator' },
    { value: 'user', label: 'user' },
  ];

  return (
    <div className="users-crud">
      <Navbar />
      <div className="crud-dashboard">
        <h1>Gestión de Usuarios</h1>
        {loading && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}
        <Table
          columns={[
            { key: 'userName', header: 'Nombre de Usuario' },
            { key: 'email', header: 'Correo Electrónico' },
            { key: 'roles', header: 'Roles' },
            { key: 'estado', header: 'Estado' }
          ]}
          data={users.map((user) => ({
            ...user,
            roles: user.roles.join(', '),
            estado: user.isLocked ? 'Bloqueado' : 'Activo',
          }))}
          renderActions={(user) => (
            <>
              <DynamicButton
                type="edit"
                onClick={() => {
                  setSelectedUser({
                    ...user,
                    roles: user.roles.split(',').map((role) => role.trim()),
                  });
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
                    await unlockUser(user.id);
                    setSelectedUser((prev) => ({ ...prev, isLocked: false }));
                  }}
                  label="Desbloquear"
                />
              )}
            </>
          )}
        />
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
           <div className="form-field">
              <label>Número de Identificación:</label>
              <input
                type="text"
                value={selectedUser.identificationNumber}
                onChange={(e) => handleFieldChange('identificationNumber', e.target.value)}
              />
              {fieldErrors.identificationNumber && <p className="error-message">{fieldErrors.identificationNumber}</p>}
            </div>
          <div>
            <div className="form-field">
              <label>Nombre de Usuario:</label>
              <input
                type="text"
                value={selectedUser.userName}
                onChange={(e) => handleFieldChange('userName', e.target.value)}
              />
              {fieldErrors.userName && <p className="error-message">{fieldErrors.userName}</p>}
            </div>
            <div className="form-field">
              <label>Nombre:</label>
              <input
                type="text"
                value={selectedUser.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
              {fieldErrors.name && <p className="error-message">{fieldErrors.name}</p>}
            </div>
            <div className="form-field">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                value={selectedUser.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
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
                }}
              />
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          title="Editar Usuario"
          onSubmit={handleEdit}
        >
          <form>
            <div className="form-field">
              <label>Nombre de Usuario:</label>
              <input
                type="text"
                value={selectedUser.userName}
                onChange={(e) =>
                  setSelectedUser((prev) => ({ ...prev, userName: e.target.value }))
                }
              />
            </div>
            <div className="form-field">
              <label>Nombre:</label>
              <input
                type="text"
                value={selectedUser.name}
                onChange={(e) =>
                  setSelectedUser((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="form-field">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="form-field">
              <label>Número de Identificación:</label>
              <input
                type="text"
                value={selectedUser.identificationNumber}
                onChange={(e) =>
                  setSelectedUser((prev) => ({ ...prev, identificationNumber: e.target.value }))
                }
              />
            </div>
            <div className="form-field">
              <label>Roles:</label>
              <Select
                isMulti
                options={roleOptions}
                value={selectedUser.roles.map((role) => ({ value: role, label: role }))}
                onChange={(selectedOptions) =>
                  setSelectedUser((prev) => ({
                    ...prev,
                    roles: selectedOptions.map((option) => option.value),
                  }))
                }
              />
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default UsersCRUD;