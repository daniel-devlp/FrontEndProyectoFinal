import React, { useEffect } from 'react';
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

  const handleCreate = (data: RoleCreateDto) => createRole(data);

  const handleUpdate = (id: string, data: RoleUpdateDto) => updateRole(id, data);

  const handleDelete = (id: string) => deleteRole(id);

  return (
    <div className="roles-crud">
      <Navbar />
      <h1>Gestión de Roles</h1>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
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
