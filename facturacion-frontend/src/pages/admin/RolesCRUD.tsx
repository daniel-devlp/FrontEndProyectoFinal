import { useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import DynamicButton from '../../components/common/DynamicButton';
import { useRoles } from '../../hooks/useRoles';
import type { RoleCreateDto, RoleUpdateDto } from '../../@types/roles';

const RolesCRUD = () => {
  const { roles, loading, error, createRole, updateRole, deleteRole, fetchRoles } = useRoles();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);
  const handleCreate = async (data: RoleCreateDto) => {
    try {
      await createRole(data);
      toast.success('Rol creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el rol');
    }
  };

  const handleUpdate = async (id: string, data: RoleUpdateDto) => {
    try {
      await updateRole(id, data);
      toast.success('Rol actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el rol');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id);
      toast.success('Rol eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el rol');
    }
  };

  return (
    <div className="roles-crud">
      <Navbar />
      <h1>Gestión de Roles</h1>      {loading && <div>Cargando roles...</div>}
      {error && toast.error(`Error: ${error}`)}
      <Table
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Nombre del Rol' },
        ]}
        data={roles}
        renderActions={(role) => (
          <>
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
          </>
        )}
      />

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
