import type { RoleDto, RoleCreateDto, RoleUpdateDto } from '../@types/roles';

const API_URL = 'http://invoiceDevWeb.somee.com/api/Roles';
const token = localStorage.getItem('authToken');

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
};

export const rolesService = {
  getRoles: async (): Promise<RoleDto[]> => {
    const response = await fetch(API_URL, { headers });
    if (!response.ok) throw new Error('Error al obtener roles');
    return response.json();
  },

  getRole: async (id: string): Promise<RoleDto> => {
    const response = await fetch(`${API_URL}/${id}`, { headers });
    if (!response.ok) throw new Error('Error al obtener rol');
    return response.json();
  },

  createRole: async (data: RoleCreateDto): Promise<void> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear rol');
  },

  updateRole: async (id: string, data: RoleUpdateDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar rol');
  },

  deleteRole: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error al eliminar rol');
  },
};
