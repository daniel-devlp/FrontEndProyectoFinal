import { useEffect } from 'react';
import { notifications, confirmAction, confirmDestructiveAction, confirmUpdateAction, withLoadingToast } from '../../utils/notifications';
import Navbar from '../../components/common/Navbar';
import Modal from '../../components/common/Modal';
import DynamicButton from '../../components/common/DynamicButton';
import { useRoles } from '../../hooks/useRoles';
import type { RoleCreateDto, RoleUpdateDto } from '../../@types/roles';

const RolesCRUD = () => {
  const { roles, loading, error, createRole, updateRole, deleteRole, fetchRoles } = useRoles();

  useEffect(() => {
    fetchRoles();  }, [fetchRoles]);  const handleCreate = async (data: RoleCreateDto) => {
    // Confirmación antes de crear
    const confirmed = await confirmAction(
      '¿Estás seguro de que deseas crear este rol?',
      'Confirmar Creación de Rol'
    );
    if (!confirmed) return;

    try {
      await withLoadingToast(
        () => createRole(data),
        'Creando rol...',
        'Rol creado exitosamente'
      );
    } catch (error) {
      notifications.error('Error al crear el rol');
    }
  };

  const handleUpdate = async (id: string, data: RoleUpdateDto) => {
    // Confirmación antes de actualizar
    const confirmed = await confirmUpdateAction(
      '¿Estás seguro de que deseas actualizar este rol?',
      'Confirmar Actualización de Rol'
    );
    if (!confirmed) return;

    try {
      await withLoadingToast(
        () => updateRole(id, data),
        'Actualizando rol...',
        'Rol actualizado exitosamente'
      );
    } catch (error) {
      notifications.error('Error al actualizar el rol');
    }
  };

  const handleDelete = async (id: string) => {
    const role = roles.find(r => r.id === id);
    const roleName = role ? role.name : 'este rol';
    
    const confirmed = await confirmDestructiveAction(
      `¿Estás seguro de que deseas eliminar ${roleName}? Esta acción no se puede deshacer.`,
      'Confirmar Eliminación de Rol',
      'Sí, eliminar rol'
    );
    
    if (confirmed) {
      try {
        await withLoadingToast(
          () => deleteRole(id),
          'Eliminando rol...',
          'Rol eliminado exitosamente'
        );
      } catch (error) {
        notifications.error('Error al eliminar el rol');
      }
    }
  };
  return (
    <div className="roles-crud">
      <Navbar />
      <h1>Gestión de Roles</h1>      {loading && <div>Cargando roles...</div>}
      {error && (() => { notifications.error(`Error: ${error}`); return null; })()}      <div className="table-container">
        <div className="roles-table-container">
          <table className="roles-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="text-left">{role.id}</td>
                  <td className="text-left">{role.name}</td>
                  <td className="text-left">
                    <div className="actions-cell">
                      <DynamicButton
                        type="edit"
                        onClick={() => handleUpdate(role.id, { id: role.id, name: 'Nuevo Nombre' })}
                        label="Editar"
                      />
                      <DynamicButton
                        type="delete"
                        onClick={() => handleDelete(role.id)}
                        label="Eliminar"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={true}
        onClose={() => console.log('Modal cerrado')}
        title="Crear Rol"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate({ name: 'Nuevo Rol' });
        }}
      >
        <form>
          <div className="form-field">
            <label>Nombre del Rol:</label>
            <input
              type="text"
              value="Nuevo Rol"
              onChange={(e) => console.log('Nombre cambiado:', e.target.value)}
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={true}
        onClose={() => console.log('Modal cerrado')}
        title="Editar Rol"
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate('roleId', { id: 'roleId', name: 'Nuevo Nombre' });
        }}
      >
        <form>
          <div className="form-field">
            <label>Nombre del Rol:</label>
            <input
              type="text"
              value="Nuevo Nombre"
              onChange={(e) => console.log('Nombre cambiado:', e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RolesCRUD;



