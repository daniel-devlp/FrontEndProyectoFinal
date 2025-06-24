import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { rolesService } from '../services/rolesService';
import type { RoleDto, RoleCreateDto, RoleUpdateDto } from '../@types/roles';

export const useRoles = () => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await rolesService.getRoles();
        setRoles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);
  const createRole = async (dto: RoleCreateDto) => {
    try {
      await rolesService.createRole(dto);
      setRoles((prev) => [...prev, { ...dto, id: Date.now().toString() }]);
      toast.success('Rol creado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al crear rol: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };
  const updateRole = async (id: string, dto: RoleUpdateDto) => {
    try {
      await rolesService.updateRole(id, dto);
      setRoles((prev) => prev.map((role) => (role.id === id ? { ...role, ...dto } : role)));
      toast.success('Rol actualizado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al actualizar rol: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };
  const deleteRole = async (id: string) => {
    try {
      await rolesService.deleteRole(id);
      setRoles((prev) => prev.filter((role) => role.id !== id));
      toast.success('Rol eliminado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al eliminar rol: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rolesService.getRoles();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return { roles, loading, error, createRole, updateRole, deleteRole, fetchRoles };
};
